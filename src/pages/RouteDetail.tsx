import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { getMockRoutes, generateMockStatus } from '@/lib/mock-data';
import { WEEKDAY_LABELS, TRANSPORT_LABELS, type CommuteRoute, type RouteStatusData } from '@/lib/types';
import { ArrowLeft, RefreshCw, MapPin, Clock, Train, Bell, BellOff, Star, Calendar } from 'lucide-react';

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<CommuteRoute | null>(null);
  const [status, setStatus] = useState<RouteStatusData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<RouteStatusData[]>([]);

  useEffect(() => {
    const r = getMockRoutes().find(r => r.id === id);
    if (r) {
      setRoute(r);
      setStatus(generateMockStatus(r.id));
      const hist = Array.from({ length: 5 }, () => generateMockStatus(r.id));
      hist.forEach((h, i) => {
        h.checked_at = new Date(Date.now() - (i + 1) * 1000 * 60 * 60 * 4).toISOString();
      });
      setHistory(hist);
    }
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    if (route) setStatus(generateMockStatus(route.id));
    setRefreshing(false);
  };

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
            {route.name.toUpperCase()}
          </h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full card-amber-border bg-card hover:bg-secondary/50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {status && (
        <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Aktueller Status</span>
            <StatusBadge status={status.status} delayMinutes={status.delay_minutes} />
          </div>
          {status.message && <p className="text-sm text-muted-foreground">{status.message}</p>}
          {status.platform_info && (
            <p className="text-xs text-muted-foreground mt-1">Aktuelles Gleis: {status.platform_info}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">
            Geprüft: {new Date(status.checked_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{route.origin.name}</p>
            <p className="text-xs text-muted-foreground">→ {route.destination.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Train className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm">{route.transportTypes.map(t => TRANSPORT_LABELS[t]).join(', ')}</p>
        </div>
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
        <div className="flex items-center gap-3">
          {route.is_paused ? <BellOff className="h-4 w-4 text-muted-foreground shrink-0" /> : <Bell className="h-4 w-4 text-primary shrink-0" />}
          <p className="text-sm">{route.is_paused ? 'Benachrichtigungen pausiert' : `Benachrichtigungen: ${route.notification_type === 'both' ? 'E-Mail & Push' : route.notification_type === 'email' ? 'E-Mail' : 'Push'}`}</p>
        </div>
      </div>

      {route.connections.length > 0 && (
        <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Gespeicherte Verbindungen</p>
          {route.connections.map(conn => (
            <div key={conn.id} className="space-y-2 py-2 border-b border-border last:border-0">
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

      <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Letzte Statusmeldungen</p>
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <StatusBadge status={h.status} delayMinutes={h.delay_minutes} size="sm" />
                {h.message && <p className="text-xs text-muted-foreground mt-1">{h.message}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(h.checked_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-[20px] card-amber-border p-5">
        <div className="text-center">
          <Train className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-xs font-medium mb-1">Live-Daten via HAFAS</p>
          <p className="text-[10px] text-muted-foreground">
            Echtzeitdaten von Deutsche Bahn werden automatisch geladen.
          </p>
        </div>
      </div>
    </div>
  );
}
