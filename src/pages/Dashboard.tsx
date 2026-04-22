import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUserRoutes, setRoutePaused } from '@/lib/routes-service';
import { getRemarks, type Remark } from '@/lib/transport-api';
import { useLiveStatus } from '@/hooks/useLiveStatus';
import type { CommuteRoute, SavedLeg, Weekday, RouteStatus } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Plus, ArrowRightLeft, AlertTriangle, Info, Construction, Train as TrainIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DebugPanel } from '@/components/DebugPanel';
import { TrialBanner } from '@/components/TrialBanner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';

function getStatusLabel(status: string, delayMinutes?: number) {
  if (status === 'on_time') return 'Pünktlich';
  if (status === 'minor_delay' && delayMinutes) return `+${delayMinutes} Min`;
  if (status === 'major_delay' && delayMinutes) return `+${delayMinutes} Min`;
  if (status === 'cancelled') return 'Ausfall';
  if (status === 'disruption') return 'Störung';
  if (status === 'platform_change') return 'Gleiswechsel';
  if (status === 'no_data') return 'Fahrplan';
  return 'Keine Daten';
}

function getStatusColor(status: string) {
  if (status === 'on_time') return 'bg-status-ontime text-status-ontime-foreground';
  if (status === 'minor_delay') return 'bg-primary text-primary-foreground';
  if (status === 'major_delay' || status === 'cancelled') return 'bg-destructive text-destructive-foreground';
  if (status === 'disruption') return 'bg-status-disruption text-status-disruption-foreground';
  if (status === 'platform_change') return 'bg-status-platform text-status-platform-foreground';
  return 'bg-muted text-muted-foreground';
}

function getStatusDotColor(status: string) {
  if (status === 'on_time') return 'bg-status-ontime';
  if (status === 'minor_delay') return 'bg-primary';
  if (status === 'major_delay' || status === 'cancelled') return 'bg-destructive';
  return 'bg-muted-foreground';
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const WEEKDAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

interface UpcomingDeparture {
  time: string;
  timeMinutes: number;
  line: string;
  originName: string;
  destinationName: string;
  routeName: string;
  status: RouteStatus;
  routeId: string;
  connectionId: string;
  delayMinutes: number;
  allLegs: SavedLeg[];
}

/** Filter remarks to those relevant to the user's saved lines */
function filterRelevantRemarks(remarks: Remark[], routes: CommuteRoute[]): Remark[] {
  // Collect all line names from saved routes
  const savedLineNames = new Set<string>();
  routes.forEach(r => {
    r.connections.forEach(c => {
      c.legs.forEach(l => {
        savedLineNames.add(l.lineName.toLowerCase().trim());
      });
    });
  });

  return remarks.filter(remark => {
    // If remark has affected lines, check if any match
    if (remark.affectedLines && remark.affectedLines.length > 0) {
      return remark.affectedLines.some(line =>
        savedLineNames.has(line.name.toLowerCase().trim())
      );
    }
    // Also check if the remark text mentions any of our lines
    const text = (remark.text + ' ' + remark.summary).toLowerCase();
    for (const lineName of savedLineNames) {
      if (text.includes(lineName)) return true;
    }
    return false;
  });
}

function getRemarkIcon(type: string) {
  if (type === 'warning') return AlertTriangle;
  if (type === 'status') return Info;
  return Construction;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [routeNews, setRouteNews] = useState<Remark[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const loadRoutes = useCallback(async () => {
    try {
      const r = await fetchUserRoutes();
      setRoutes(r);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Routen laden fehlgeschlagen:', err);
    } finally {
      setRoutesLoading(false);
    }
  }, []);

  // Fetch route news/remarks from HAFAS
  const loadNews = useCallback(async (currentRoutes: CommuteRoute[]) => {
    if (currentRoutes.length === 0) {
      setRouteNews([]);
      setNewsLoading(false);
      return;
    }
    setNewsLoading(true);
    try {
      const allRemarks = await getRemarks({ results: 100 });
      const relevant = filterRelevantRemarks(allRemarks, currentRoutes);
      setRouteNews(relevant.slice(0, 10));
    } catch {
      setRouteNews([]);
    }
    setNewsLoading(false);
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    if (routes.length > 0) {
      loadNews(routes);
    } else {
      setNewsLoading(false);
    }
  }, [routes, loadNews]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const now = new Date();
  const todayKey = WEEKDAY_KEYS[now.getDay()];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Build today's connection list for live status fetching
  const todayConnections = useMemo(() => {
    const conns: Array<{ connectionId: string; routeId: string; routeName: string; legs: SavedLeg[] }> = [];
    routes.forEach(route => {
      if (route.is_paused) return;
      route.connections.forEach(conn => {
        if (!conn.weekdays.includes(todayKey)) return;
        if (conn.legs.length === 0) return;
        conns.push({
          connectionId: conn.id,
          routeId: route.id,
          routeName: route.name,
          legs: conn.legs,
        });
      });
    });
    return conns;
  }, [routes, todayKey]);

  const { statuses: liveStatuses } = useLiveStatus({
    connections: todayConnections,
    enabled: todayConnections.length > 0,
  });

  // Map live status by connection id
  const liveByConnection = useMemo(() => {
    const map = new Map<string, typeof liveStatuses[0]>();
    liveStatuses.forEach(s => map.set(s.connectionId, s));
    return map;
  }, [liveStatuses]);

  // Today's departures for the hero card (with live status)
  const todayDepartures = useMemo<UpcomingDeparture[]>(() => {
    const deps: UpcomingDeparture[] = [];
    routes.forEach(route => {
      if (route.is_paused) return;
      route.connections.forEach(conn => {
        if (!conn.weekdays.includes(todayKey)) return;
        if (conn.legs.length === 0) return;
        const firstLeg = conn.legs[0];
        const depMinutes = timeToMinutes(firstLeg.plannedDeparture);
        const live = liveByConnection.get(conn.id);
        deps.push({
          time: firstLeg.plannedDeparture,
          timeMinutes: depMinutes,
          line: firstLeg.lineName,
          originName: firstLeg.originName,
          destinationName: conn.legs[conn.legs.length - 1].destinationName,
          routeName: route.name,
          status: live?.overallStatus || 'no_data',
          routeId: route.id,
          connectionId: conn.id,
          delayMinutes: live?.legs[0]?.delayMinutes || 0,
          allLegs: conn.legs,
        });
      });
    });
    deps.sort((a, b) => {
      const aFuture = a.timeMinutes >= nowMinutes;
      const bFuture = b.timeMinutes >= nowMinutes;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      return a.timeMinutes - b.timeMinutes;
    });
    return deps;
  }, [routes, liveByConnection, todayKey, nowMinutes]);

  // Next day's departures
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = WEEKDAY_KEYS[tomorrowDate.getDay()];
  const tomorrowLabel = tomorrowDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  const tomorrowDepartures = useMemo<UpcomingDeparture[]>(() => {
    const deps: UpcomingDeparture[] = [];
    routes.forEach(route => {
      if (route.is_paused) return;
      route.connections.forEach(conn => {
        if (!conn.weekdays.includes(tomorrowKey)) return;
        if (conn.legs.length === 0) return;
        const firstLeg = conn.legs[0];
        const depMinutes = timeToMinutes(firstLeg.plannedDeparture);
        deps.push({
          time: firstLeg.plannedDeparture,
          timeMinutes: depMinutes,
          line: firstLeg.lineName,
          originName: firstLeg.originName,
          destinationName: conn.legs[conn.legs.length - 1].destinationName,
          routeName: route.name,
          status: 'no_data',
          routeId: route.id,
          connectionId: conn.id,
          delayMinutes: 0,
          allLegs: conn.legs,
        });
      });
    });
    deps.sort((a, b) => a.timeMinutes - b.timeMinutes);
    return deps;
  }, [routes, tomorrowKey]);

  const nextDep = todayDepartures.length > 0 ? todayDepartures[0] : null;
  const unreadCount = 0;

  const handleTogglePause = async (routeId: string, currentlyPaused: boolean) => {
    // Optimistic update
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, is_paused: !currentlyPaused } : r));
    try {
      await setRoutePaused(routeId, !currentlyPaused);
    } catch (err) {
      // Revert
      setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, is_paused: currentlyPaused } : r));
      const message = err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen';
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="px-5 pt-5 pb-4 min-h-screen">
      <DebugPanel />
      <TrialBanner />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Pendly</h1>
          <span className="flex items-center gap-1.5 bg-primary/15 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            Live
          </span>
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground">
              vor {secondsAgo < 2 ? 'jetzt' : `${secondsAgo} Sek.`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-2xl card-amber-border bg-card hover:bg-secondary transition-colors shadow-sm"
          >
            <Bell className="h-4.5 w-4.5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <Avatar className="h-8 w-8 card-amber-border">
            <AvatarFallback className="bg-card text-muted-foreground text-xs font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </motion.header>

      {/* Next Departure Hero Card */}
      {nextDep && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate('/today')}
          className="card-amber-glow bg-card rounded-[20px] p-5 mb-3 cursor-pointer hover:bg-secondary/30 transition-colors shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] mb-1 text-muted-foreground">
                Nächste Abfahrt · {nextDep.routeName}
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-5xl text-foreground">
                  {nextDep.time}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {nextDep.line}
                </span>
              </div>
            </div>
            <span className={cn(
              'text-[11px] font-semibold px-2.5 py-1 rounded-full',
              getStatusColor(nextDep.status)
            )}>
              {getStatusLabel(nextDep.status, nextDep.delayMinutes)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm text-foreground font-medium">{nextDep.originName}</p>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{nextDep.destinationName}</p>
          </div>

          {nextDep.allLegs.length > 1 && (
            <div className="mt-3 pt-3 space-y-1.5 border-t border-border">
              {nextDep.allLegs.map((leg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{leg.plannedDeparture}</span>
                  <span className="bg-secondary text-foreground px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {leg.lineName}
                  </span>
                  <span className="truncate">{leg.originName} → {leg.destinationName}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* "Heute anders fahren" Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onClick={() => navigate('/route-setup')}
        className="w-full card-amber-border bg-card rounded-[16px] px-4 py-3 mb-5 flex items-center gap-3 hover:bg-secondary/50 transition-colors shadow-sm"
      >
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Heute anders unterwegs?</p>
          <p className="text-[11px] text-muted-foreground">Einmalige Route für heute hinzufügen</p>
        </div>
        <Plus className="h-4 w-4 text-muted-foreground" />
      </motion.button>

      {/* Tomorrow's Connections */}
      {tomorrowDepartures.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1 text-muted-foreground">
            Morgen · {tomorrowLabel}
          </h2>
          <p className="text-[10px] text-muted-foreground mb-3">
            {tomorrowDepartures.length} Verbindung{tomorrowDepartures.length !== 1 ? 'en' : ''} geplant
          </p>
          <div className="space-y-2">
            {tomorrowDepartures.map((dep, i) => (
              <div
                key={i}
                className="card-amber-border bg-card rounded-[16px] px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-shrink-0">
                  <span className="font-display text-xl text-foreground">{dep.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="bg-secondary text-foreground px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {dep.line}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{dep.routeName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {dep.originName} → {dep.destinationName}
                  </p>
                </div>
                {dep.allLegs.length > 1 && (
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {dep.allLegs.length}x
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Neuigkeiten zu deinen Routen */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Neuigkeiten zu deinen Routen
          </h2>
          {routeNews.length > 0 && (
            <span className="text-[10px] bg-primary/15 text-primary font-semibold px-2 py-0.5 rounded-full">
              {routeNews.length} Meldung{routeNews.length !== 1 ? 'en' : ''}
            </span>
          )}
        </div>

        {newsLoading ? (
          <div className="card-amber-border bg-card rounded-[16px] p-4 flex items-center justify-center">
            <div className="amber-spinner" />
            <span className="text-xs text-muted-foreground ml-3">Aktuelle Meldungen laden…</span>
          </div>
        ) : routeNews.length === 0 ? (
          <div className="card-amber-border bg-card rounded-[16px] p-5 text-center">
            <TrainIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Alles in Ordnung</p>
            <p className="text-[11px] text-muted-foreground">
              Aktuell gibt es keine Meldungen zu deinen Routen.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {routeNews.map((remark) => {
              const IconComp = getRemarkIcon(remark.type);
              const isWarning = remark.type === 'warning';

              return (
                <div
                  key={remark.id}
                  className={cn(
                    'bg-card rounded-[16px] p-4',
                    isWarning ? 'border border-destructive/20' : 'card-amber-border'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      isWarning ? 'bg-destructive/15' : 'bg-primary/15'
                    )}>
                      <IconComp className={cn('h-4 w-4', isWarning ? 'text-destructive' : 'text-primary')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {remark.summary && (
                        <p className="text-sm font-semibold text-foreground mb-1">{remark.summary}</p>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {remark.text}
                      </p>
                      {remark.affectedLines && remark.affectedLines.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {remark.affectedLines.map((line, i) => (
                            <span key={i} className="text-[10px] font-bold bg-secondary text-foreground px-1.5 py-0.5 rounded">
                              {line.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {remark.validUntil && (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Gültig bis: {new Date(remark.validUntil).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* My Routes Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3 text-muted-foreground">
          Meine Routen
        </h2>
        {routesLoading ? (
          <div className="card-amber-border bg-card rounded-[20px] p-6 flex items-center justify-center">
            <div className="amber-spinner" />
          </div>
        ) : routes.length === 0 ? (
          <EmptyState
            icon="route"
            title="Noch keine Routen"
            description="Lege deine erste Pendelroute an, damit Pendly sie überwachen kann."
          >
            <button
              onClick={() => navigate('/route-setup')}
              className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-bold text-sm"
            >
              Route hinzufügen
            </button>
          </EmptyState>
        ) : (
          <div className="space-y-2.5">
            {routes.map((route) => {
              const firstLeg = route.connections[0]?.legs[0];
              return (
                <div
                  key={route.id}
                  onClick={() => navigate(`/route/${route.id}`)}
                  className="card-amber-border bg-card rounded-[20px] p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{route.name}</p>
                      {firstLeg && (
                        <span className="text-[10px] font-semibold bg-secondary text-foreground px-2 py-0.5 rounded-lg">
                          {firstLeg.lineName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {route.origin.name} → {route.destination.name}
                    </p>
                  </div>
                  <Switch
                    checked={!route.is_paused}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => handleTogglePause(route.id, route.is_paused)}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
                  />
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </motion.section>
    </div>
  );
}
