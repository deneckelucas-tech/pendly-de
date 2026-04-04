import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, RefreshCw, Wrench, ArrowRight, Repeat, Footprints, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { searchJourneys, formatTime, formatDelay } from '@/lib/transport-api';
import { getLineBadgeStyle } from '@/lib/line-colors';
import type { Station, TransportType, Journey, Weekday } from '@/lib/types';
import { WEEKDAY_LABELS } from '@/lib/types';

interface JourneySelectStepProps {
  origin: Station;
  destination: Station;
  transportTypes: TransportType[];
  arrivalTime?: string;
  onNext: (journeys: Journey[], weekdays: Weekday[]) => void;
  onBack: () => void;
  onManual: () => void;
}

export function JourneySelectStep({ origin, destination, transportTypes, arrivalTime: initialArrivalTime, onNext, onBack, onManual }: JourneySelectStepProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [localDepartureTime, setLocalDepartureTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState<Set<Weekday>>(new Set(['mon', 'tue', 'wed', 'thu', 'fri']));
  const [hasSearched, setHasSearched] = useState(false);

  const fetchJourneys = useCallback(async () => {
    setLoading(true);
    setError(false);
    setHasSearched(true);
    try {
      const params: any = { results: 15 };
      if (localDepartureTime) {
        const now = new Date();
        const [h, m] = localDepartureTime.split(':').map(Number);
        const dep = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        if (dep < now) dep.setDate(dep.getDate() + 1);
        params.departure = dep.toISOString();
      }
      if (transportTypes.length > 0) {
        const products: Partial<Record<TransportType, boolean>> = {};
        const all: TransportType[] = ['nationalExpress', 'national', 'regionalExpress', 'regional', 'suburban', 'bus', 'ferry', 'subway', 'tram'];
        for (const t of all) products[t] = transportTypes.includes(t);
        params.products = products;
      }

      let results = await searchJourneys(origin.id, destination.id, params);
      if (results.length === 0) {
        results = await searchJourneys(origin.id, destination.id, { results: 15 });
      }
      setJourneys(results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [origin.id, destination.id, transportTypes, localDepartureTime]);

  const toggleJourney = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getDuration = (journey: Journey): string => {
    if (journey.legs.length === 0) return '';
    const dep = new Date(journey.legs[0].departure);
    const arr = new Date(journey.legs[journey.legs.length - 1].arrival);
    const mins = Math.round((arr.getTime() - dep.getTime()) / 60000);
    if (mins < 60) return `${mins} Min.`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getWalkingLegs = (journey: Journey) => {
    return journey.legs.filter(l => !l.line || l.line.productName === 'walking' || l.line.mode === 'walking');
  };

  const getPrimaryColor = (journey: Journey): string => {
    const firstTransitLeg = journey.legs.find(l => l.line && l.line.productName !== 'walking');
    if (!firstTransitLeg?.line) return '#374151';
    return getLineBadgeStyle(firstTransitLeg.line.productName || '', firstTransitLeg.line.name || '').bg;
  };

  const selectedJourneys = journeys.filter(j => selected.has(j.id));
  const originShort = origin.name.split(',')[0];
  const destShort = destination.name.split(',')[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      {/* Nav */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <h1 className="font-display tracking-tight text-foreground mb-4" style={{ fontSize: 44, lineHeight: 1 }}>WÄHLE DEINE ZÜGE</h1>

      {/* Journey map strip */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">{originShort}</span>
        <div className="flex-1 h-px bg-primary/30 mx-1" />
        <span className="text-xs font-semibold text-foreground truncate">{destShort}</span>
        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
      </div>

      {/* Weekday selection */}
      <div className="mb-4">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Pendeltage</label>
        <div className="flex gap-1.5">
          {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as Weekday[]).map(day => {
            const isActive = selectedDays.has(day);
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDays(prev => {
                    const next = new Set(prev);
                    next.has(day) ? next.delete(day) : next.add(day);
                    return next;
                  });
                }}
                className="flex-1 h-10 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: isActive ? 'hsl(var(--primary))' : '#1A1A1A',
                  color: isActive ? '#000' : '#6B7280',
                  border: isActive ? 'none' : '1px solid #1F1F1F',
                }}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Departure time picker */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Ab wann fährst du?</label>
          <input
            type="time"
            value={localDepartureTime}
            onChange={e => setLocalDepartureTime(e.target.value)}
            className="w-full h-12 rounded-2xl px-4 text-sm text-foreground outline-none border border-transparent focus:border-primary transition-all"
            style={{ backgroundColor: '#1A1A1A' }}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchJourneys}
            disabled={loading}
            className="h-12 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="amber-spinner" style={{ width: 16, height: 16, borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> : <RefreshCw className="h-4 w-4" />}
            Suchen
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Wähle alle Verbindungen die du regelmäßig nimmst</p>

      <div className="flex-1 space-y-3 overflow-y-auto pb-28">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="amber-spinner" />
          </div>
        )}

        {error && !loading && (
          <button onClick={fetchJourneys} className="w-full text-center py-12">
            <RefreshCw className="h-5 w-5 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive font-medium mb-1">Verbindung fehlgeschlagen</p>
            <p className="text-xs text-muted-foreground">Tippe zum Wiederholen</p>
          </button>
        )}

        {!loading && !error && journeys.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-2">Keine Verbindungen gefunden</p>
            <button onClick={fetchJourneys} className="text-xs text-primary font-medium">
              Erneut suchen
            </button>
          </div>
        )}

        {!loading && journeys.map(journey => {
          const isSelected = selected.has(journey.id);
          const firstLeg = journey.legs[0];
          const lastLeg = journey.legs[journey.legs.length - 1];
          if (!firstLeg || !lastLeg) return null;

          const transfers = journey.legs.filter(l => l.line && l.line.productName !== 'walking').length - 1;
          const isDirect = transfers <= 0;
          const walkLegs = getWalkingLegs(journey);
          const primaryColor = getPrimaryColor(journey);

          return (
            <button
              key={journey.id}
              onClick={() => toggleJourney(journey.id)}
              className={cn(
                'w-full text-left p-4 rounded-[20px] transition-all relative',
                'active:scale-[0.99]'
              )}
              style={{
                backgroundColor: isSelected ? 'rgba(245,158,11,0.04)' : '#111111',
                border: isSelected ? '1px solid #F59E0B' : '1px solid #1F1F1F',
                borderLeft: `3px solid ${isSelected ? '#F59E0B' : primaryColor}`,
              }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}

              {/* Times row */}
              <div className="flex items-center justify-between mb-1 pr-8">
                <span className="font-display text-foreground leading-none" style={{ fontSize: 40 }}>{formatTime(firstLeg.departure)}</span>
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <span className="font-display text-foreground leading-none" style={{ fontSize: 40 }}>{formatTime(lastLeg.arrival)}</span>
              </div>

              {/* Duration right-aligned */}
              <p className="text-xs text-muted-foreground text-right mb-3">{getDuration(journey)}</p>

              {/* Line badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {journey.legs
                  .filter(l => l.line && l.line.productName !== 'walking')
                  .map((leg, i) => {
                    const style = getLineBadgeStyle(leg.line?.productName || '', leg.line?.name || '');
                    return (
                      <span
                        key={i}
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {leg.line?.name || leg.line?.productName || '?'}
                      </span>
                    );
                  })}
                {isDirect && (
                  <span
                    style={{
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    Direktverbindung
                  </span>
                )}
              </div>

              {/* Bottom row: transfers + walking */}
              <div className="flex items-center gap-3 flex-wrap">
                {!isDirect && (
                  <div className="flex items-center gap-1">
                    <Repeat className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{transfers}x Umstieg</span>
                  </div>
                )}
                {walkLegs.map((wl, i) => {
                  const walkMins = wl.departure && wl.arrival
                    ? Math.round((new Date(wl.arrival).getTime() - new Date(wl.departure).getTime()) / 60000)
                    : 0;
                  if (walkMins <= 0) return null;
                  return (
                    <div key={`walk-${i}`} className="flex items-center gap-1">
                      <Footprints className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{walkMins} Min Fußweg</span>
                    </div>
                  );
                })}
              </div>

              {firstLeg.cancelled && <span className="text-xs font-semibold text-destructive mt-1 block">Ausfall</span>}
            </button>
          );
        })}

        {/* Manual option */}
        {!loading && (
          <button
            onClick={onManual}
            className="w-full p-4 rounded-[20px] flex items-center gap-3 transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ backgroundColor: '#111111', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-foreground">Route manuell bauen</p>
              <p className="text-xs text-muted-foreground">Verbindungen einzeln zusammenstellen</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4"
        style={{ backgroundColor: '#000000', borderTop: '1px solid #1A1A1A', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} Verbindung${selected.size !== 1 ? 'en' : ''} gewählt`
              : 'Keine Auswahl'}
          </p>
          <button
            onClick={() => onNext(selectedJourneys, Array.from(selectedDays))}
            disabled={selected.size === 0}
            className={cn(
              'h-12 px-6 rounded-full font-bold text-sm flex items-center gap-2 transition-all',
              selected.size > 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'
            )}
          >
            Weiter
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
