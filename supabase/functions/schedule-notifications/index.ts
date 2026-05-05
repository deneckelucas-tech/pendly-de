/**
 * schedule-notifications — wird per Cron jede Minute aufgerufen.
 *
 * Logik:
 *   1. Hole alle Connections, die heute laufen und Notifications aktiv haben
 *   2. Für jeden Leg: prüfe Live-Status via transport.rest
 *   3. Bei Pre-Departure-Window (T-X min, X aus user_preferences): Pre-Check Push
 *   4. Bei Verspätung/Ausfall/Gleisänderung: sofortige Push (dedupt via notification_log)
 *   5. Quiet Hours respektieren
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

interface Leg {
  id: string;
  connection_id: string;
  user_id: string;
  origin_id: string;
  destination_id: string;
  origin_name: string;
  destination_name: string;
  line_name: string;
  planned_departure: string; // HH:mm
  planned_arrival: string;
  leg_index: number;
}

interface Connection {
  id: string;
  user_id: string;
  route_id: string;
  weekdays: string[];
  notifications_enabled: boolean;
}

interface Prefs {
  user_id: string;
  push_enabled: boolean;
  pre_departure_minutes: number;
  notify_delays: boolean;
  notify_cancellations: boolean;
  notify_disruptions: boolean;
  notify_platform_changes: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

function isQuietHours(now: Date, start: string, end: string): boolean {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const sMin = sh * 60 + sm;
  const eMin = eh * 60 + em;
  if (sMin === eMin) return false;
  if (sMin < eMin) return mins >= sMin && mins < eMin;
  // overnight (e.g. 22:00 → 06:00)
  return mins >= sMin || mins < eMin;
}

function timeToTodayDate(hhmm: string, base: Date): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

async function checkLeg(originId: string, destId: string, plannedDep: Date): Promise<{
  delayMin: number;
  cancelled: boolean;
  platformChange: boolean;
  newPlatform?: string;
} | null> {
  try {
    const fromIso = new Date(plannedDep.getTime() - 5 * 60_000).toISOString();
    const url = `https://v6.db.transport.rest/journeys?from=${encodeURIComponent(originId)}&to=${encodeURIComponent(destId)}&departure=${encodeURIComponent(fromIso)}&results=3`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const journeys = json.journeys || [];
    if (journeys.length === 0) return null;

    // Find best match by planned departure
    let best: any = null;
    let bestDiff = Infinity;
    for (const j of journeys) {
      const leg = j.legs?.[0];
      if (!leg?.plannedDeparture) continue;
      const diff = Math.abs(new Date(leg.plannedDeparture).getTime() - plannedDep.getTime());
      if (diff < bestDiff) { bestDiff = diff; best = leg; }
    }
    if (!best || bestDiff > 10 * 60_000) return null;

    const cancelled = best.cancelled === true;
    const delayMin = best.departureDelay ? Math.round(best.departureDelay / 60) : 0;
    const platformChange = best.departurePlatform && best.plannedDeparturePlatform
      && best.departurePlatform !== best.plannedDeparturePlatform;

    return { delayMin, cancelled, platformChange, newPlatform: best.departurePlatform };
  } catch (err) {
    console.error('checkLeg error:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const todayKey = WEEKDAY_KEYS[now.getDay()];

  try {
    // 1. Active connections for today
    const { data: connections, error: connErr } = await admin
      .from('saved_connections')
      .select('id, user_id, route_id, weekdays, notifications_enabled')
      .eq('notifications_enabled', true)
      .contains('weekdays', [todayKey]);

    if (connErr) throw connErr;
    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ checked: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Their legs
    const connIds = connections.map((c: Connection) => c.id);
    const { data: legs } = await admin
      .from('saved_legs')
      .select('*')
      .in('connection_id', connIds);

    if (!legs || legs.length === 0) {
      return new Response(JSON.stringify({ checked: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Their prefs
    const userIds = [...new Set(connections.map((c: Connection) => c.user_id))];
    const { data: prefsList } = await admin
      .from('user_preferences')
      .select('*')
      .in('user_id', userIds);

    const prefsByUser = new Map<string, Prefs>(
      (prefsList ?? []).map((p: Prefs) => [p.user_id, p]),
    );
    const connById = new Map<string, Connection>(connections.map((c: Connection) => [c.id, c]));

    let checked = 0;
    let pushed = 0;
    const today = now.toISOString().slice(0, 10);

    // Pre-load today's notification log so we can skip HAFAS calls for legs
    // whose dedup keys already fired. notification_log has UNIQUE(user_id, dedup_key)
    // but checking up-front saves ~1 HAFAS call per already-notified leg per minute.
    const { data: sentLog } = await admin
      .from('notification_log')
      .select('user_id, dedup_key')
      .gte('created_at', `${today}T00:00:00Z`);

    const sentKeys = new Set<string>(
      (sentLog ?? []).map((r: { user_id: string; dedup_key: string }) => `${r.user_id}|${r.dedup_key}`),
    );
    const wasSent = (userId: string, dedup: string) => sentKeys.has(`${userId}|${dedup}`);

    // 4. Walk every leg of every active connection. Pendler often have transfers,
    // so a problem on leg 1 or 2 must be detected too.
    for (const leg of legs as Leg[]) {
      const conn = connById.get(leg.connection_id);
      if (!conn) continue;
      const prefs = prefsByUser.get(conn.user_id);
      if (!prefs || !prefs.push_enabled) continue;
      if (isQuietHours(now, prefs.quiet_hours_start, prefs.quiet_hours_end)) continue;

      const plannedDep = timeToTodayDate(leg.planned_departure, now);
      const minutesUntil = Math.round((plannedDep.getTime() - now.getTime()) / 60_000);

      // Out of window: > 5 min after departure (already gone) or > pre_departure_minutes (too far)
      if (minutesUntil < -5 || minutesUntil > prefs.pre_departure_minutes) continue;

      // Dedup-keys we *might* fire for this leg today. If every relevant key is
      // already in the log, skip the HAFAS call entirely.
      const legBase = `${today}:${leg.connection_id}:l${leg.leg_index}`;
      const possibleKeys = [
        `${legBase}:cancellation:cancel`,
        `${legBase}:platform_change`, // prefix-match handled below
        `${legBase}:delay`,
        `${legBase}:pre_departure:precheck`,
      ];
      const cancelFired = wasSent(conn.user_id, possibleKeys[0]);
      const preCheckFired = wasSent(conn.user_id, possibleKeys[3]);
      // For delay/platform we have multiple sub-keys, so we always re-check.

      // If cancelled-push already fired we don't need to check this leg again today.
      if (cancelFired) continue;

      checked++;
      const status = await checkLeg(leg.origin_id, leg.destination_id, plannedDep);
      if (!status) continue;

      const sendPush = async (kind: string, title: string, body: string, severity: 'info' | 'warning' | 'critical', dedupSuffix: string) => {
        const dedup = `${legBase}:${kind}:${dedupSuffix}`;
        if (wasSent(conn.user_id, dedup)) return;
        const res = await admin.functions.invoke('send-push', {
          body: {
            user_id: conn.user_id,
            title,
            body,
            kind,
            severity,
            dedup_key: dedup,
            connection_id: conn.id,
            route_id: conn.route_id,
            data: { route_id: conn.route_id, connection_id: conn.id, kind, leg_index: String(leg.leg_index) },
          },
        });
        if (!res.error) {
          pushed++;
          sentKeys.add(`${conn.user_id}|${dedup}`);
        }
      };

      // Cancellation → highest priority
      if (status.cancelled && prefs.notify_cancellations) {
        await sendPush(
          'cancellation',
          `${leg.line_name} fällt aus`,
          `${leg.origin_name} → ${leg.destination_name}. Wir suchen eine Alternative.`,
          'critical',
          'cancel',
        );
        continue;
      }

      // Verspätung
      if (status.delayMin >= 3 && prefs.notify_delays) {
        const sev: 'info' | 'warning' | 'critical' = status.delayMin >= 15 ? 'critical' : 'warning';
        await sendPush(
          'delay',
          `${leg.line_name} +${status.delayMin} Min.`,
          `${leg.origin_name} → ${leg.destination_name}`,
          sev,
          `delay-${Math.floor(status.delayMin / 5) * 5}`, // dedup pro 5-Min-Stufe
        );
      }

      // Gleiswechsel
      if (status.platformChange && prefs.notify_platform_changes) {
        await sendPush(
          'platform_change',
          'Gleiswechsel',
          `${leg.line_name} fährt jetzt von Gleis ${status.newPlatform}.`,
          'warning',
          `platform-${status.newPlatform}`,
        );
      }

      // Pre-Departure Reminder: fire once when entering the configured window,
      // only if no problems are detected. Window is [pre_departure_minutes - 5,
      // pre_departure_minutes] so a delayed cron tick won't miss it.
      if (
        leg.leg_index === 0 &&
        !preCheckFired &&
        minutesUntil >= prefs.pre_departure_minutes - 5 &&
        minutesUntil <= prefs.pre_departure_minutes &&
        status.delayMin < 3 &&
        !status.cancelled &&
        !status.platformChange
      ) {
        await sendPush(
          'pre_departure',
          'Bahn pünktlich',
          `${leg.line_name} fährt in ${minutesUntil} Min. von ${leg.origin_name}.`,
          'info',
          'precheck',
        );
      }
    }

    return new Response(JSON.stringify({ checked, pushed, connections: connections.length }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('schedule-notifications error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
