import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { fetchRoute, deleteRoute, setRoutePaused } from '@/lib/routes-service';
import { useLiveStatus } from '@/hooks/useLiveStatus';
import { WEEKDAY_LABELS, TRANSPORT_LABELS, type CommuteRoute, type Weekday, type SavedLeg } from '@/lib/types';
import { ArrowLeft, RefreshCw, MapPin, Clock, Train, Bell, BellOff, Star, Calendar, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WEEKDAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<CommuteRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRoute(id)
      .then(r => setRoute(r))
      .catch(err => console.error('Route laden fehlgeschlagen:', err))
      .finally(() => setLoading(false));
  }, [id]);

  // Build today's connections for live status
  const todayKey = WEEKDAY_KEYS[new Date().getDay()];
  const todayConnections = useMemo(() => {
    if (!route) return [];
    const conns: Array<{ connectionId: string; routeId: string; routeName: string; legs: SavedLeg[] }> = [];
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
    return conns;
  }, [route, todayKey]);

  const { statuses: liveStatuses, refetch, loading: liveLoading } = useLiveStatus({
    connections: todayConnections,
    enabled: todayConnections.length > 0,
  });

  const handleTogglePause = async () => {
    if (!route) return;
    const newPaused = !route.is_paused;
    setRoute({ ...route, is_paused: newPaused });
    try {
      await setRoutePaused(route.id, newPaused);
    } catch (err) {
      setRoute({ ...route, is_paused: !newPaused });
      const message = err instanceof Error ? err.message : 'Aktualisierung fehlgeschlagen';
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!route) return;
    if (!confirm(`Route "${route.name}" wirklich löschen?`)) return;
    setDeleting(true);
    try {
      await deleteRoute(route.id);
      toast({ title: 'Route gelöscht' });
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Löschen fehlgeschlagen';
      toast({ title: 'Fehler', description: message, variant: 'destructive' });
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="amber-spinner" /></div>;
  if (!route) return <div className="p-4 text-center text-muted-foreground">Route nicht gefunden.</div>;

  const firstConnection = route.connections[0];
  const weekdays = firstConnection?.weekdays || [];

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl text-foreground truncate flex items-center gap-2">
            {route.is_favorite && <Star className="h-4 w-4 fill-primary text-primary" />}
            {route.name}
          </h1>
        </div>
        <button
          onClick={() => refetch()}
          disabled={liveLoading}
          className="p-2 rounded-full card-amber-border bg-card hover:bg-secondary/50 transition-colors shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${liveLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Live status per connection (today only) */}
      {todayConnections.length > 0 && (
        <div className="space-y-2 mb-4">
          {todayConnections.map(conn => {
            const live = liveStatuses.find(s => s.connectionId === conn.connectionId);
            const status = live?.overallStatus || 'no_data';
            const delay = live?.legs[0]?.delayMinutes;
            return (
              <div key={conn.connectionId} className="bg-card rounded-[20px] card-amber-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {conn.legs[0].plannedDeparture} · {conn.legs[0].lineName}
                  </span>
                  <StatusBadge status={status} delayMinutes={delay} />
                </div>
                {live?.legs[0]?.message && (
                  <p className="text-sm text-muted-foreground">{live.legs[0].message}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  Geprüft: {live?.legs[0]?.lastChecked.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) || '–'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4 space-y-3 shadow-sm">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{route.origin.name}</p>
            <p className="text-xs text-muted-foreground">→ {route.destination.name}</p>
          </div>
        </div>
        {route.transportTypes.length > 0 && (
          <div className="flex items-center gap-3">
            <Train className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm">{route.transportTypes.map(t => TRANSPORT_LABELS[t]).join(', ')}</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="flex gap-1">
            {weekdays.map(d => (
              <span key={d} className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full font-medium">
                {WEEKDAY_LABELS[d]}
              </span>
            ))}
          </div>
        </div>
        <button onClick={handleTogglePause} className="flex items-center gap-3 w-full text-left">
          {route.is_paused ? <BellOff className="h-4 w-4 text-muted-foreground shrink-0" /> : <Bell className="h-4 w-4 text-primary shrink-0" />}
          <p className="text-sm">{route.is_paused ? 'Benachrichtigungen pausiert (tippen zum Aktivieren)' : `Benachrichtigungen aktiv (tippen zum Pausieren)`}</p>
        </button>
      </div>

      {route.connections.length > 0 && (
        <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Gespeicherte Verbindungen</p>
          {route.connections.map(conn => (
            <div key={conn.id} className="space-y-2 py-2 border-b border-border last:border-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {conn.weekdays.map(d => WEEKDAY_LABELS[d]).join(', ')}
              </p>
              {conn.legs.map((leg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="font-display text-lg text-foreground w-12">{leg.plannedDeparture}</span>
                  <span className="bg-secondary text-foreground px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                    {leg.lineName}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {leg.originName} → {leg.destinationName}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full bg-card rounded-[20px] border border-destructive/30 p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        <span className="text-sm font-semibold">Route löschen</span>
      </button>
    </div>
  );
}
