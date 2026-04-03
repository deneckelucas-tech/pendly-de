import { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { StationSearch } from '@/components/StationSearch';
import { getDepartures, formatTime } from '@/lib/transport-api';
import type { Station, Journey, JourneyLeg, Departure } from '@/lib/types';

interface ManualLeg {
  origin: Station;
  departure: Departure;
}

interface ManualJourneyBuilderProps {
  initialOrigin: Station;
  finalDestination: Station;
  onSave: (journey: Journey) => void;
  onBack: () => void;
}

export function ManualJourneyBuilder({ initialOrigin, finalDestination, onSave, onBack }: ManualJourneyBuilderProps) {
  const [legs, setLegs] = useState<ManualLeg[]>([]);
  const [currentOrigin, setCurrentOrigin] = useState<Station>(initialOrigin);
  const [departureTime, setDepartureTime] = useState('07:00');
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDepartures = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const now = new Date();
    const [h, m] = departureTime.split(':').map(Number);
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const results = await getDepartures(currentOrigin.id, { when: when.toISOString(), duration: 120, results: 20 });
    setDepartures(results);
    setLoading(false);
  }, [currentOrigin.id, departureTime]);

  const addLeg = (dep: Departure) => {
    const leg: ManualLeg = { origin: currentOrigin, departure: dep };
    const newLegs = [...legs, leg];
    setLegs(newLegs);

    // Set next origin to the departure's destination if available
    if (dep.destination) {
      setCurrentOrigin({ id: dep.destination.id, name: dep.destination.name, type: 'station', products: {} });
    }
    setDepartures([]);
    setSearched(false);

    // Auto-advance time
    if (dep.when) {
      const arr = new Date(dep.when);
      arr.setMinutes(arr.getMinutes() + 30); // estimate
      const hh = String(arr.getHours()).padStart(2, '0');
      const mm = String(arr.getMinutes()).padStart(2, '0');
      setDepartureTime(`${hh}:${mm}`);
    }
  };

  const removeLeg = (index: number) => {
    const newLegs = legs.slice(0, index);
    setLegs(newLegs);
    if (newLegs.length > 0) {
      const lastDep = newLegs[newLegs.length - 1].departure;
      if (lastDep.destination) {
        setCurrentOrigin({ id: lastDep.destination.id, name: lastDep.destination.name, type: 'station', products: {} });
      }
    } else {
      setCurrentOrigin(initialOrigin);
    }
    setDepartures([]);
    setSearched(false);
  };

  const buildJourney = (): Journey => {
    const journeyLegs: JourneyLeg[] = legs.map(leg => ({
      origin: { id: leg.origin.id, name: leg.origin.name, type: 'station', products: leg.origin.products || {} },
      destination: leg.departure.destination
        ? { id: leg.departure.destination.id, name: leg.departure.destination.name, type: 'station', products: {} }
        : { id: '', name: leg.departure.direction, type: 'station', products: {} },
      departure: leg.departure.when,
      arrival: '', // Not available from departures API
      plannedDeparture: leg.departure.plannedWhen,
      plannedArrival: '',
      departureDelay: leg.departure.delay,
      arrivalDelay: null,
      departurePlatform: leg.departure.platform,
      line: {
        id: leg.departure.line.id,
        name: leg.departure.line.name,
        productName: leg.departure.line.productName,
        mode: leg.departure.line.mode,
      },
      direction: leg.departure.direction,
      cancelled: false,
    }));
    return { id: `manual-${Date.now()}`, legs: journeyLegs };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-4rem)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Route zusammenstellen</h1>
          <p className="text-sm text-muted-foreground">Baue deine Verbindung Schritt für Schritt</p>
        </div>
      </div>

      {/* Added legs */}
      {legs.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Deine Verbindung</p>
          {legs.map((leg, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card" style={{ border: '1px solid rgba(245,158,11,0.08)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-foreground">{formatTime(leg.departure.when)}</span>
                  <span className="text-xs font-semibold bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{leg.departure.line.name}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {leg.origin.name} → {leg.departure.direction}
                </p>
              </div>
              <button onClick={() => removeLeg(i)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Current search */}
      <div className="space-y-3 mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {legs.length === 0 ? 'Erste Verbindung' : 'Umstieg hinzufügen'}
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-card" style={{ border: '1px solid rgba(245,158,11,0.08)' }}>
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{currentOrigin.name}</span>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Ab wann?</label>
            <input
              type="time"
              value={departureTime}
              onChange={e => setDepartureTime(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={searchDepartures} disabled={loading} className="h-10 rounded-xl font-semibold gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              Suchen
            </Button>
          </div>
        </div>
      </div>

      {/* Departure results */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        )}

        {!loading && searched && departures.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Keine Abfahrten gefunden</p>
        )}

        {!loading && departures.map((dep, i) => (
          <button
            key={`${dep.tripId}-${i}`}
            onClick={() => addLeg(dep)}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground w-12">{formatTime(dep.when)}</span>
              <span className="text-xs font-semibold bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{dep.line.name}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate flex-1">{dep.direction}</span>
            </div>
            {dep.platform && <p className="text-[10px] text-muted-foreground mt-0.5 ml-12">Gleis {dep.platform}</p>}
          </button>
        ))}
      </div>

      {/* Save button */}
      {legs.length > 0 && (
        <div className="mt-4 pb-4">
          <Button
            onClick={() => onSave(buildJourney())}
            className="w-full h-12 rounded-xl font-semibold text-sm"
          >
            Verbindung mit {legs.length} Abschnitt{legs.length !== 1 ? 'en' : ''} speichern
          </Button>
        </div>
      )}
    </motion.div>
  );
}
