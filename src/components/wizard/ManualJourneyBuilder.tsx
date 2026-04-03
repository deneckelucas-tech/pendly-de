import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, Clock, MapPin, ArrowRight, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { searchStations, getDepartures, formatTime, type Departure } from '@/lib/transport-api';
import type { Station, Journey, JourneyLeg } from '@/lib/types';

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
  const [filterText, setFilterText] = useState('');
  const [showStationSearch, setShowStationSearch] = useState(false);
  const [stationQuery, setStationQuery] = useState('');
  const [stationResults, setStationResults] = useState<Station[]>([]);
  const [stationLoading, setStationLoading] = useState(false);

  // Auto-search departures on mount
  useEffect(() => {
    searchDepartures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchDepartures = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const now = new Date();
    const [h, m] = departureTime.split(':').map(Number);
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (when < now) when.setDate(when.getDate() + 1);
    const results = await getDepartures(currentOrigin.id, { when: when.toISOString(), duration: 120, results: 30 });
    setDepartures(results);
    setLoading(false);
  }, [currentOrigin.id, departureTime]);

  const handleStationSearch = useCallback(async (q: string) => {
    setStationQuery(q);
    if (q.length < 2) { setStationResults([]); return; }
    setStationLoading(true);
    const results = await searchStations(q);
    setStationResults(results);
    setStationLoading(false);
  }, []);

  const selectStation = (station: Station) => {
    setCurrentOrigin(station);
    setShowStationSearch(false);
    setStationQuery('');
    setStationResults([]);
    setDepartures([]);
    setSearched(false);
  };

  const addLeg = (dep: Departure) => {
    const leg: ManualLeg = { origin: currentOrigin, departure: dep };
    const newLegs = [...legs, leg];
    setLegs(newLegs);

    if (dep.destination) {
      setCurrentOrigin({ id: dep.destination.id, name: dep.destination.name, type: 'station', products: {} });
    }
    setDepartures([]);
    setSearched(false);
    setFilterText('');

    // Auto-advance time by estimated travel + transfer
    if (dep.when) {
      const arr = new Date(dep.when);
      arr.setMinutes(arr.getMinutes() + 30);
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
    setFilterText('');
  };

  const buildJourney = (): Journey => {
    const journeyLegs: JourneyLeg[] = legs.map(leg => ({
      origin: { id: leg.origin.id, name: leg.origin.name, type: 'station', products: leg.origin.products || {} },
      destination: leg.departure.destination
        ? { id: leg.departure.destination.id, name: leg.departure.destination.name, type: 'station', products: {} }
        : { id: '', name: leg.departure.direction, type: 'station', products: {} },
      departure: leg.departure.when,
      arrival: '',
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

  // Filter departures by direction/line
  const filteredDepartures = departures.filter(dep => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return dep.direction.toLowerCase().includes(q) || 
           dep.line.name.toLowerCase().includes(q) ||
           dep.line.productName.toLowerCase().includes(q);
  });

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
                  {leg.origin.name.split(',')[0]} → {leg.departure.direction}
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

        {/* Origin station - clickable to change */}
        <button
          onClick={() => setShowStationSearch(!showStationSearch)}
          className="w-full flex items-center gap-2 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors"
          style={{ border: '1px solid rgba(245,158,11,0.08)' }}
        >
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate flex-1 text-left">{currentOrigin.name.split(',')[0]}</span>
          {showStationSearch ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>

        {/* Station search overlay */}
        {showStationSearch && (
          <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
            <input
              type="text"
              value={stationQuery}
              onChange={e => handleStationSearch(e.target.value)}
              placeholder="Andere Haltestelle suchen…"
              autoFocus
              className="w-full h-10 rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-background"
              style={{ border: '1px solid #2A2A2A' }}
            />
            {stationLoading && (
              <div className="flex justify-center py-3">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
            )}
            {stationResults.map(s => (
              <button
                key={s.id}
                onClick={() => selectStation(s)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{s.name.split(',')[0]}</p>
                {s.name.includes(',') && <p className="text-xs text-muted-foreground">{s.name.split(',').slice(1).join(',').trim()}</p>}
              </button>
            ))}
          </div>
        )}

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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Suchen
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      {departures.length > 0 && (
        <div className="mb-2">
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Filtern: Richtung oder Linie…"
            className="w-full h-9 rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
          />
        </div>
      )}

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

        {!loading && searched && filteredDepartures.length === 0 && departures.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Kein Treffer für „{filterText}"</p>
        )}

        {!loading && filteredDepartures.map((dep, i) => (
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
