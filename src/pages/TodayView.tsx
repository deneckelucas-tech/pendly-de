import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserRoutes } from '@/lib/routes-service';
import { useLiveStatus } from '@/hooks/useLiveStatus';
import type { CommuteRoute, Weekday, RouteStatus } from '@/lib/types';
import { ArrowLeft, RefreshCw, Clock, AlertTriangle, CheckCircle, XCircle, Info, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const STATUS_CONFIG: Record<RouteStatus, { label: string; icon: typeof CheckCircle; colorClass: string; dotClass: string }> = {
  on_time: { label: 'Pünktlich', icon: CheckCircle, colorClass: 'text-green-400', dotClass: 'bg-green-400' },
  minor_delay: { label: 'Leicht verspätet', icon: Clock, colorClass: 'text-primary', dotClass: 'bg-primary' },
  major_delay: { label: 'Stark verspätet', icon: AlertTriangle, colorClass: 'text-red-400', dotClass: 'bg-red-400' },
  cancelled: { label: 'Ausfall', icon: XCircle, colorClass: 'text-red-500', dotClass: 'bg-red-500' },
  disruption: { label: 'Störung', icon: Bus, colorClass: 'text-orange-400', dotClass: 'bg-orange-400' },
  platform_change: { label: 'Gleisänderung', icon: Info, colorClass: 'text-blue-400', dotClass: 'bg-blue-400' },
  no_data: { label: 'Keine Daten', icon: Info, colorClass: 'text-muted-foreground', dotClass: 'bg-muted-foreground' },
};

export default function TodayView() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);

  useEffect(() => {
    fetchUserRoutes().then(setRoutes).catch(err => console.error('Routen laden fehlgeschlagen:', err));
  }, []);

  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[new Date().getDay()] as Weekday;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  // Build flat list of today's upcoming connections
  const todayConnections = useMemo(() => {
    const conns: Array<{
      connectionId: string;
      routeId: string;
      routeName: string;
      legs: CommuteRoute['connections'][0]['legs'];
    }> = [];

    routes.forEach(route => {
      route.connections.forEach(conn => {
        if (!conn.weekdays.includes(todayKey)) return;
        if (conn.legs.length === 0) return;

        const firstLegMin = timeToMinutes(conn.legs[0].plannedDeparture);
        // Only show upcoming (with 30 min grace for past)
        if (firstLegMin < nowMinutes - 30) return;

        conns.push({
          connectionId: conn.id,
          routeId: route.id,
          routeName: route.name,
          legs: conn.legs,
        });
      });
    });

    return conns.sort((a, b) => {
      const aMin = timeToMinutes(a.legs[0].plannedDeparture);
      const bMin = timeToMinutes(b.legs[0].plannedDeparture);
      return aMin - bMin;
    });
  }, [routes, todayKey, nowMinutes]);

  const { statuses, loading, refetch } = useLiveStatus({
    connections: todayConnections,
    enabled: todayConnections.length > 0,
  });

  // Merge statuses with connections for display
  const displayItems = useMemo(() => {
    return todayConnections.map(conn => {
      const live = statuses.find(s => s.connectionId === conn.connectionId);
      return { conn, live };
    });
  }, [todayConnections, statuses]);

  const isNextConnection = (index: number) => {
    // First non-past connection is "next"
    return index === 0;
  };

  return (
    <div className="px-5 pt-5 pb-24 min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-foreground">HEUTE</h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => {
            refetch();
          }}
          disabled={loading}
          className="p-2 rounded-full card-amber-border bg-card hover:bg-secondary/50 transition-colors shadow-sm"
        >
          <RefreshCw className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
        </button>
      </motion.header>

      {/* Loading */}
      {loading && displayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="amber-spinner" />
          <p className="text-sm text-muted-foreground">Echtzeitdaten werden geladen…</p>
        </div>
      )}

      {/* No connections today */}
      {!loading && displayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CheckCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Heute keine weiteren Verbindungen</p>
        </div>
      )}

      {/* Connection list */}
      <AnimatePresence>
        {displayItems.map(({ conn, live }, index) => {
          const isNext = isNextConnection(index);
          const overallStatus = live?.overallStatus || 'no_data';
          const config = STATUS_CONFIG[overallStatus];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={conn.connectionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'bg-card rounded-[20px] p-5 mb-3 transition-all',
                isNext ? 'card-amber-glow' : 'card-amber-border'
              )}
            >
              {/* Connection header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  {isNext && (
                    <span className="text-[10px] uppercase tracking-[0.1em] text-primary font-semibold mb-1 block">
                      Nächste Verbindung
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className={cn('font-display', isNext ? 'text-4xl' : 'text-2xl', 'text-foreground')}>
                      {conn.legs[0].plannedDeparture}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{conn.routeName}</span>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
                  overallStatus === 'on_time' && 'bg-green-500/15 text-green-400',
                  overallStatus === 'minor_delay' && 'bg-primary/15 text-primary',
                  overallStatus === 'major_delay' && 'bg-red-500/15 text-red-400',
                  overallStatus === 'cancelled' && 'bg-red-500/15 text-red-500',
                  overallStatus === 'disruption' && 'bg-orange-500/15 text-orange-400',
                  overallStatus === 'no_data' && 'bg-muted text-muted-foreground',
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </div>
              </div>

              {/* Legs */}
              <div className="space-y-2">
                {conn.legs.map((leg, legIdx) => {
                  const legLive = live?.legs[legIdx];
                  const legStatus = legLive?.status || 'no_data';
                  const legConfig = STATUS_CONFIG[legStatus];

                  return (
                    <div key={legIdx} className="flex items-start gap-3">
                      {/* Timeline dot & line */}
                      <div className="flex flex-col items-center pt-1.5">
                        <div className={cn('h-2.5 w-2.5 rounded-full', legConfig.dotClass)} />
                        {legIdx < conn.legs.length - 1 && (
                          <div className="w-px h-8 bg-border mt-1" />
                        )}
                      </div>

                      {/* Leg details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{leg.plannedDeparture}</span>
                          {legLive?.delayMinutes && legLive.delayMinutes > 0 && (
                            <span className={cn('text-xs font-semibold', legConfig.colorClass)}>
                              +{legLive.delayMinutes}'
                            </span>
                          )}
                          {legLive?.actualDeparture && legLive.actualDeparture !== leg.plannedDeparture && (
                            <span className="text-xs text-muted-foreground line-through">{leg.plannedDeparture}</span>
                          )}
                          <span className="bg-secondary text-foreground px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {leg.lineName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {leg.originName} → {leg.destinationName}
                        </p>
                        {legLive?.message && legStatus !== 'on_time' && (
                          <p className={cn('text-[11px] mt-1 font-medium', legConfig.colorClass)}>
                            {legLive.message}
                          </p>
                        )}
                        {legLive?.replacementInfo && (
                          <div className="flex items-center gap-1 mt-1">
                            <Bus className="h-3 w-3 text-orange-400" />
                            <span className="text-[11px] text-orange-400 font-medium">{legLive.replacementInfo}</span>
                          </div>
                        )}
                        {legLive?.actualPlatform && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Gleis {legLive.actualPlatform}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Last checked */}
              {live && live.legs.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border">
                  Zuletzt geprüft: {live.legs[0].lastChecked.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
