import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Loader2, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { searchJourneys, formatTime, formatDelay } from '@/lib/transport-api';
import type { Station, TransportType, Journey } from '@/lib/types';

interface JourneySelectStepProps {
  origin: Station;
  destination: Station;
  transportTypes: TransportType[];
  onNext: (journeys: Journey[]) => void;
  onBack: () => void;
}

export function JourneySelectStep({ origin, destination, transportTypes, onNext, onBack }: JourneySelectStepProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const ALL_TRANSPORT: TransportType[] = ['nationalExpress', 'national', 'regionalExpress', 'regional', 'suburban', 'bus', 'ferry', 'subway', 'tram'];

  const fetchJourneys = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const products: Partial<Record<TransportType, boolean>> = {};
      for (const t of ALL_TRANSPORT) products[t] = transportTypes.includes(t);
      let results = await searchJourneys(origin.id, destination.id, { results: 8, products });
      // If no results with filters, retry without product filters
      if (results.length === 0) {
        results = await searchJourneys(origin.id, destination.id, { results: 8 });
      }
      setJourneys(results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [origin.id, destination.id, transportTypes]);

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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-4rem)]"
    >
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Verbindungen wählen</h1>
          <p className="text-sm text-muted-foreground">{origin.name} → {destination.name}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4 ml-1">Wähle die Verbindungen, mit denen du normalerweise fährst.</p>

      <div className="flex-1 space-y-2.5 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
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
          <p className="text-sm text-muted-foreground text-center py-12">Keine Verbindungen gefunden</p>
        )}

        {!loading && journeys.map(journey => {
          const isSelected = selected.has(journey.id);
          const firstLeg = journey.legs[0];
          const lastLeg = journey.legs[journey.legs.length - 1];
          if (!firstLeg || !lastLeg) return null;

          const lines = journey.legs.map(l => l.line?.name || l.line?.productName || '?').join(' → ');
          const delay = formatDelay(firstLeg.departureDelay);

          return (
            <button
              key={journey.id}
              onClick={() => toggleJourney(journey.id)}
              className={cn(
                'w-full text-left p-4 rounded-2xl transition-all relative',
                isSelected
                  ? 'bg-primary/10'
                  : 'card-amber-border bg-card hover:bg-secondary/50'
              )}
              style={isSelected ? { border: '1.5px solid hsl(38 92% 50%)' } : {}}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="text-lg font-bold text-foreground">{formatTime(firstLeg.departure)}</span>
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-lg font-bold text-foreground">{formatTime(lastLeg.arrival)}</span>
                <span className="text-xs text-muted-foreground ml-auto">{getDuration(journey)}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">{lines}</span>
                {journey.legs.length > 1 && (
                  <span className="text-[10px] text-muted-foreground">{journey.legs.length - 1}x Umstieg</span>
                )}
                {delay && <span className="text-[10px] font-semibold text-primary">{delay}</span>}
                {firstLeg.cancelled && <span className="text-[10px] font-semibold text-destructive">Ausfall</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pb-4">
        <Button
          onClick={() => onNext(selectedJourneys)}
          disabled={selected.size === 0}
          className="w-full h-12 rounded-xl font-semibold text-sm"
        >
          {selected.size === 0
            ? 'Verbindungen auswählen'
            : `${selected.size} Verbindung${selected.size !== 1 ? 'en' : ''} speichern`}
        </Button>
      </div>
    </motion.div>
  );
}
