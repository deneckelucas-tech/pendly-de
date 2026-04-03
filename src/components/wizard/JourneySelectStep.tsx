import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, RefreshCw, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { searchJourneys, formatTime, formatDelay } from '@/lib/transport-api';
import type { Station, TransportType, Journey } from '@/lib/types';

interface JourneySelectStepProps {
  origin: Station;
  destination: Station;
  transportTypes: TransportType[];
  arrivalTime?: string;
  onNext: (journeys: Journey[]) => void;
  onBack: () => void;
  onManual: () => void;
}

export function JourneySelectStep({ origin, destination, transportTypes, arrivalTime, onNext, onBack, onManual }: JourneySelectStepProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchJourneys = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: any = { results: 8 };
      if (arrivalTime) {
        const now = new Date();
        const [h, m] = arrivalTime.split(':').map(Number);
        const arr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        if (arr < now) arr.setDate(arr.getDate() + 1);
        params.arrival = arr.toISOString();
      }
      if (transportTypes.length > 0) {
        const products: Partial<Record<TransportType, boolean>> = {};
        const all: TransportType[] = ['nationalExpress', 'national', 'regionalExpress', 'regional', 'suburban', 'bus', 'ferry', 'subway', 'tram'];
        for (const t of all) products[t] = transportTypes.includes(t);
        params.products = products;
      }

      let results = await searchJourneys(origin.id, destination.id, params);
      if (results.length === 0) {
        results = await searchJourneys(origin.id, destination.id, { results: 8 });
      }
      setJourneys(results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [origin.id, destination.id, transportTypes, arrivalTime]);

  useEffect(() => { fetchJourneys(); }, [fetchJourneys]);

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

  const selectedJourneys = journeys.filter(j => selected.has(j.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-3rem)]"
    >
      {/* Nav */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <h1 className="font-display text-4xl tracking-tight text-foreground mb-1">WÄHLE DEINE ZÜGE</h1>
      <p className="text-sm text-muted-foreground mb-1">
        {origin.name.split(',')[0]} → {destination.name.split(',')[0]}
      </p>
      <p className="text-xs text-muted-foreground mb-6">Wähle alle Verbindungen die du regelmäßig nimmst</p>

      <div className="flex-1 space-y-2.5 overflow-y-auto pb-28">
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

          const delay = formatDelay(firstLeg.departureDelay);

          return (
            <button
              key={journey.id}
              onClick={() => toggleJourney(journey.id)}
              className={cn(
                'w-full text-left p-4 rounded-[20px] transition-all relative',
                isSelected
                  ? 'bg-primary/10 border border-primary'
                  : 'bg-card card-amber-border hover:bg-secondary/50'
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
              {/* Departure time large */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-3xl text-foreground">{formatTime(firstLeg.departure)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-display text-3xl text-foreground">{formatTime(lastLeg.arrival)}</span>
                <span className="text-xs text-muted-foreground ml-auto">{getDuration(journey)}</span>
              </div>
              {/* Line badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {journey.legs.map((leg, i) => (
                  <span key={i} className="text-[11px] font-semibold bg-secondary text-foreground px-2 py-0.5 rounded-lg">
                    {leg.line?.name || leg.line?.productName || '?'}
                  </span>
                ))}
                {journey.legs.length > 1 && (
                  <span className="text-[10px] text-muted-foreground ml-1">{journey.legs.length - 1}x Umstieg</span>
                )}
                {delay && <span className="text-[10px] font-semibold text-primary ml-1">{delay}</span>}
                {firstLeg.cancelled && <span className="text-[10px] font-semibold text-destructive ml-1">Ausfall</span>}
              </div>
            </button>
          );
        })}

        {/* Manual option */}
        {!loading && (
          <button
            onClick={onManual}
            className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <Wrench className="h-3.5 w-3.5" />
            Route manuell zusammenstellen
          </button>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-lg mx-auto">
          {selected.size > 0 && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              {selected.size} Verbindung{selected.size !== 1 ? 'en' : ''} ausgewählt
            </p>
          )}
          <button
            onClick={() => onNext(selectedJourneys)}
            disabled={selected.size === 0}
            className={cn(
              'w-full h-14 rounded-full font-bold text-sm transition-all',
              selected.size > 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            Weiter
          </button>
        </div>
      </div>
    </motion.div>
  );
}
