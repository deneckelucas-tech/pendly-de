import { useState, useEffect, useCallback, useRef } from 'react';
import { getDepartures, type Departure } from '@/lib/transport-api';
import type { SavedLeg, RouteStatus } from '@/lib/types';

export interface LiveLegStatus {
  leg: SavedLeg;
  status: RouteStatus;
  delayMinutes: number;
  actualDeparture: string | null; // HH:mm
  actualPlatform: string | null;
  message: string;
  cancelled: boolean;
  replacementInfo: string | null;
  lastChecked: Date;
  loading: boolean;
}

export interface LiveConnectionStatus {
  connectionId: string;
  routeId: string;
  routeName: string;
  scheduledDeparture: string; // HH:mm of first leg
  legs: LiveLegStatus[];
  overallStatus: RouteStatus;
  isPast: boolean;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function matchDeparture(departures: Departure[], leg: SavedLeg): Departure | null {
  const legMin = timeToMinutes(leg.plannedDeparture);

  // Find best match: same line name, within ±30 min window
  let best: Departure | null = null;
  let bestDiff = Infinity;

  for (const dep of departures) {
    // Match line name (case-insensitive, trim)
    const depLineName = dep.line?.name?.trim().toLowerCase() || '';
    const legLineName = leg.lineName.trim().toLowerCase();
    if (depLineName !== legLineName) continue;

    const depTime = new Date(dep.plannedWhen || dep.when);
    const depMin = depTime.getHours() * 60 + depTime.getMinutes();
    const diff = Math.abs(depMin - legMin);

    if (diff < bestDiff && diff <= 30) {
      bestDiff = diff;
      best = dep;
    }
  }

  return best;
}

function deriveLegStatus(dep: Departure | null, leg: SavedLeg): LiveLegStatus {
  if (!dep) {
    return {
      leg,
      status: 'no_data',
      delayMinutes: 0,
      actualDeparture: null,
      actualPlatform: null,
      message: 'Keine Echtzeitdaten verfügbar',
      cancelled: false,
      replacementInfo: null,
      lastChecked: new Date(),
      loading: false,
    };
  }

  const delaySec = dep.delay || 0;
  const delayMin = Math.round(Math.abs(delaySec) / 60);
  const cancelled = dep.when === null || dep.when === undefined;

  // Check for replacement service (bus instead of train)
  const productName = dep.line?.productName?.toLowerCase() || '';
  const isReplacement = productName.includes('bus') && !leg.productName.toLowerCase().includes('bus');
  const replacementInfo = isReplacement ? `Ersatzverkehr mit ${dep.line?.productName || 'Bus'}` : null;

  let status: RouteStatus;
  let message: string;

  if (cancelled) {
    status = 'cancelled';
    message = `${leg.lineName} fällt aus`;
  } else if (isReplacement) {
    status = 'disruption';
    message = replacementInfo || 'Schienenersatzverkehr';
  } else if (delayMin >= 15) {
    status = 'major_delay';
    message = `${leg.lineName} ca. ${delayMin} Min. Verspätung`;
  } else if (delayMin >= 3) {
    status = 'minor_delay';
    message = `${leg.lineName} ca. ${delayMin} Min. Verspätung`;
  } else {
    status = 'on_time';
    message = `${leg.lineName} fährt pünktlich`;
  }

  const actualTime = dep.when ? new Date(dep.when) : null;
  const actualDeparture = actualTime
    ? actualTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : null;

  return {
    leg,
    status,
    delayMinutes: delayMin,
    actualDeparture,
    actualPlatform: dep.platform || null,
    message,
    cancelled,
    replacementInfo,
    lastChecked: new Date(),
    loading: false,
  };
}

function getOverallStatus(legStatuses: LiveLegStatus[]): RouteStatus {
  if (legStatuses.some(l => l.status === 'cancelled')) return 'cancelled';
  if (legStatuses.some(l => l.status === 'disruption')) return 'disruption';
  if (legStatuses.some(l => l.status === 'major_delay')) return 'major_delay';
  if (legStatuses.some(l => l.status === 'minor_delay')) return 'minor_delay';
  if (legStatuses.some(l => l.status === 'platform_change')) return 'platform_change';
  if (legStatuses.every(l => l.status === 'on_time')) return 'on_time';
  return 'no_data';
}

interface UseLiveStatusOptions {
  connections: Array<{
    connectionId: string;
    routeId: string;
    routeName: string;
    legs: SavedLeg[];
  }>;
  enabled?: boolean;
}

export function useLiveStatus({ connections, enabled = true }: UseLiveStatusOptions) {
  const [statuses, setStatuses] = useState<LiveConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef<Record<string, number>>({});

  const fetchStatus = useCallback(async (conn: UseLiveStatusOptions['connections'][0], isNext: boolean) => {
    const now = Date.now();
    const lastFetch = lastFetchRef.current[conn.connectionId] || 0;
    const interval = isNext ? 60_000 : 300_000; // 60s for next, 5min for rest

    if (now - lastFetch < interval) return null; // Skip if recently fetched
    lastFetchRef.current[conn.connectionId] = now;

    const nowDate = new Date();
    const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
    const firstLegMin = conn.legs.length > 0 ? timeToMinutes(conn.legs[0].plannedDeparture) : 0;
    const isPast = firstLegMin < nowMinutes - 30; // 30 min grace period

    if (isPast) return null; // Don't fetch past connections

    const legStatuses: LiveLegStatus[] = [];

    for (const leg of conn.legs) {
      try {
        // Build a time window: 30 min before to 60 min after planned departure
        const legMin = timeToMinutes(leg.plannedDeparture);
        const whenDate = new Date();
        whenDate.setHours(Math.floor(Math.max(0, legMin - 30) / 60), Math.max(0, legMin - 30) % 60, 0, 0);

        const departures = await getDepartures(leg.originId, {
          when: whenDate.toISOString(),
          duration: 90,
          results: 30,
        });

        const matched = matchDeparture(departures, leg);
        legStatuses.push(deriveLegStatus(matched, leg));
      } catch {
        legStatuses.push({
          leg,
          status: 'no_data',
          delayMinutes: 0,
          actualDeparture: null,
          actualPlatform: null,
          message: 'Abfrage fehlgeschlagen',
          cancelled: false,
          replacementInfo: null,
          lastChecked: new Date(),
          loading: false,
        });
      }
    }

    return {
      connectionId: conn.connectionId,
      routeId: conn.routeId,
      routeName: conn.routeName,
      scheduledDeparture: conn.legs[0]?.plannedDeparture || '--:--',
      legs: legStatuses,
      overallStatus: getOverallStatus(legStatuses),
      isPast,
    } satisfies LiveConnectionStatus;
  }, []);

  const fetchAll = useCallback(async () => {
    if (!enabled || connections.length === 0) {
      setLoading(false);
      return;
    }

    const nowDate = new Date();
    const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

    // Sort by departure time, find the "next" one
    const sorted = [...connections].sort((a, b) => {
      const aMin = a.legs[0] ? timeToMinutes(a.legs[0].plannedDeparture) : 0;
      const bMin = b.legs[0] ? timeToMinutes(b.legs[0].plannedDeparture) : 0;
      return aMin - bMin;
    });

    const nextIdx = sorted.findIndex(c => {
      const min = c.legs[0] ? timeToMinutes(c.legs[0].plannedDeparture) : 0;
      return min >= nowMinutes - 10;
    });

    const results: LiveConnectionStatus[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const isNext = i === (nextIdx >= 0 ? nextIdx : 0);
      const result = await fetchStatus(sorted[i], isNext);
      if (result) {
        results.push(result);
      }
    }

    if (results.length > 0) {
      setStatuses(prev => {
        const map = new Map(prev.map(s => [s.connectionId, s]));
        results.forEach(r => map.set(r.connectionId, r));
        return Array.from(map.values());
      });
    }

    setLoading(false);
  }, [connections, enabled, fetchStatus]);

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Polling: check every 30s, the fetchStatus function internally throttles
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      // Reset throttle timestamps so next poll actually fetches
      lastFetchRef.current = {};
      fetchAll();
    }, 60_000); // Re-check every 60s
    return () => clearInterval(interval);
  }, [enabled, fetchAll]);

  return { statuses, loading, refetch: fetchAll };
}
