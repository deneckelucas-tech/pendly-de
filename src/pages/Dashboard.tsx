import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMockRoutes, generateMockAlerts, generateMockStatus } from '@/lib/mock-data';
import type { CommuteRoute, RouteStatusData, Alert, SavedLeg } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Plus, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DebugPanel } from '@/components/DebugPanel';
import { TrialBanner } from '@/components/TrialBanner';

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

/** Parse "HH:mm" to minutes since midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Get the earliest departure leg of a route */
function getEarliestDeparture(route: CommuteRoute): SavedLeg | null {
  let earliest: SavedLeg | null = null;
  let earliestMin = Infinity;
  for (const conn of route.connections) {
    if (conn.legs.length > 0) {
      const leg = conn.legs[0];
      const min = timeToMinutes(leg.plannedDeparture);
      if (min < earliestMin) {
        earliestMin = min;
        earliest = leg;
      }
    }
  }
  return earliest;
}

interface UpcomingDeparture {
  time: string;
  timeMinutes: number;
  line: string;
  originName: string;
  destinationName: string;
  routeName: string;
  status: string;
  routeId: string;
  allLegs: SavedLeg[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RouteStatusData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const loadData = useCallback(() => {
    const mockRoutes = getMockRoutes();
    setRoutes(mockRoutes);
    const newStatuses: Record<string, RouteStatusData> = {};
    mockRoutes.forEach(r => { newStatuses[r.id] = generateMockStatus(r.id); });
    setStatuses(newStatuses);
    setAlerts(generateMockAlerts(mockRoutes));
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[new Date().getDay()];

  // Build a flat list of all upcoming departures sorted by time, filtered to today
  const allDepartures = useMemo<UpcomingDeparture[]>(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const deps: UpcomingDeparture[] = [];

    routes.forEach(route => {
      route.connections.forEach(conn => {
        if (!conn.weekdays.includes(todayKey)) return;
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
          status: statuses[route.id]?.status || 'no_data',
          routeId: route.id,
          allLegs: conn.legs,
        });
      });
    });

    // Sort: future departures first (by time), then past departures
    deps.sort((a, b) => {
      const aFuture = a.timeMinutes >= nowMinutes;
      const bFuture = b.timeMinutes >= nowMinutes;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      return a.timeMinutes - b.timeMinutes;
    });

    return deps;
  }, [routes, statuses, todayKey]);

  const nextDep = allDepartures.length > 0 ? allDepartures[0] : null;
  const upcomingDeps = allDepartures.slice(1, 4);

  const unreadCount = alerts.filter(a => !a.is_read).length;

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
          <img src="/logo.png" alt="Pendly" className="h-7 w-7 rounded-lg" />
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
            className="relative p-2 rounded-2xl card-amber-border bg-card hover:bg-secondary transition-colors"
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
          className="card-amber-glow bg-card rounded-[20px] p-5 mb-3"
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
              {getStatusLabel(nextDep.status, statuses[nextDep.routeId]?.delay_minutes)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm text-foreground font-medium">{nextDep.originName}</p>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{nextDep.destinationName}</p>
          </div>

          {/* Multi-leg display */}
          {nextDep.allLegs.length > 1 && (
            <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid hsl(var(--border))' }}>
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
        className="w-full card-amber-border bg-card rounded-[16px] px-4 py-3 mb-5 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
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

      {/* Upcoming Departures Strip */}
      {upcomingDeps.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3 text-muted-foreground">
            Kommende Verbindungen
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
            {upcomingDeps.map((dep, i) => (
              <div
                key={i}
                className="flex-shrink-0 card-amber-border bg-card rounded-[20px] px-4 py-3 min-w-[140px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('h-2 w-2 rounded-full animate-pulse-dot', getStatusDotColor(dep.status))} />
                  <span className="font-display text-2xl text-foreground">{dep.time}</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">{dep.line}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{dep.routeName}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* My Routes Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3 text-muted-foreground">
          Meine Routen
        </h2>
        <div className="space-y-2.5">
          {routes.map((route) => {
            const status = statuses[route.id];
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
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
                />
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
