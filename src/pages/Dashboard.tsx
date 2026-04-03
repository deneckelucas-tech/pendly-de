import { useState, useEffect, useCallback } from 'react';
import { getMockRoutes, generateMockAlerts, generateMockStatus } from '@/lib/mock-data';
import type { CommuteRoute, RouteStatusData, Alert } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DebugPanel } from '@/components/DebugPanel';

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

function getDepartureProgress(): number {
  const now = new Date();
  const minutes = now.getMinutes();
  return Math.min(100, Math.max(5, (minutes / 60) * 100));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RouteStatusData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadData = useCallback(() => {
    const mockRoutes = getMockRoutes();
    setRoutes(mockRoutes);
    const newStatuses: Record<string, RouteStatusData> = {};
    mockRoutes.forEach(r => { newStatuses[r.id] = generateMockStatus(r.id); });
    setStatuses(newStatuses);
    setAlerts(generateMockAlerts(mockRoutes));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[new Date().getDay()];
  const todayRoutes = routes.filter(r =>
    r.connections.some(c => c.weekdays.includes(todayKey))
  );

  const nextDeparture = todayRoutes.length > 0 ? todayRoutes[0] : null;
  const nextStatus = nextDeparture ? statuses[nextDeparture.id] : null;
  const nextLeg = nextDeparture?.connections[0]?.legs[0];

  const upcomingDepartures = todayRoutes.flatMap(route =>
    route.connections.flatMap(conn =>
      conn.legs.map(leg => ({
        time: leg.plannedDeparture,
        line: leg.lineName,
        station: leg.originName,
        status: statuses[route.id]?.status || 'no_data',
        routeId: route.id,
      }))
    )
  ).slice(1, 4);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="px-4 pt-5 pb-4 min-h-screen">
      <DebugPanel />
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Bahnfrei</h1>
          <span className="flex items-center gap-1.5 bg-primary/15 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl card-amber-border bg-card hover:bg-secondary transition-colors"
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
      {nextDeparture && nextLeg && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-amber-glow bg-card rounded-2xl p-5 mb-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Nächste Abfahrt</p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {nextLeg.plannedDeparture}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {nextLeg.lineName}
                </span>
              </div>
            </div>
            {nextStatus && (
              <span className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-lg',
                getStatusColor(nextStatus.status)
              )}>
                {getStatusLabel(nextStatus.status, nextStatus.delay_minutes)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm text-foreground font-medium">{nextLeg.originName}</p>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{nextLeg.destinationName}</p>
          </div>

          <div>
            <div className="flex justify-between text-[10px] mb-1.5" style={{ color: '#6B7280' }}>
              <span>Jetzt</span>
              <span>Abfahrt</span>
            </div>
            <div className="relative">
              <Progress value={getDepartureProgress()} className="h-1.5 bg-secondary [&>div]:bg-primary [&>div]:progress-glow" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Departures Strip */}
      {upcomingDepartures.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#6B7280' }}>
            Kommende Verbindungen
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {upcomingDepartures.map((dep, i) => (
              <div
                key={i}
                className="flex-shrink-0 card-amber-border bg-card rounded-2xl px-4 py-3 min-w-[120px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('h-2 w-2 rounded-full animate-pulse-dot', getStatusDotColor(dep.status))} />
                  <span className="text-lg font-bold text-foreground">{dep.time}</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">{dep.line}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{dep.station}</p>
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
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#6B7280' }}>
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
                className="card-amber-border bg-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{route.name}</p>
                    {firstLeg && (
                      <span className="text-[10px] font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">
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
