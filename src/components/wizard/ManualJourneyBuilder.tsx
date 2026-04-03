import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Trash2, MapPin, ArrowRight, Search, Train } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchStations, getDepartures, formatTime, type Departure } from '@/lib/transport-api';
import { getLineBadgeStyle } from '@/lib/line-colors';
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
    // After adding a leg, auto-open station search so user can change intermediate stop
    setShowStationSearch(true);
    if (dep.when) {
      const arr = new Date(dep.when);
      arr.setMinutes(arr.getMinutes() + 30);
      setDepartureTime(`${String(arr.getHours()).padStart(2, '0')}:${String(arr.getMinutes()).padStart(2, '0')}`);
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
      line: { id: leg.departure.line.id, name: leg.departure.line.name, productName: leg.departure.line.productName, mode: leg.departure.line.mode },
      direction: leg.departure.direction,
      cancelled: false,
    }));
    return { id: `manual-${Date.now()}`, legs: journeyLegs };
  };

  const filteredDepartures = departures.filter(dep => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return dep.direction.toLowerCase().includes(q) || dep.line.name.toLowerCase().includes(q) || dep.line.productName.toLowerCase().includes(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-3rem)]"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <h1 className="font-display text-3xl tracking-tight text-foreground mb-2">ROUTE ZUSAMMENSTELLEN</h1>

      {/* Route header: Start → Ziel */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">{initialOrigin.name.split(',')[0]}</span>
        <div className="flex-1 h-px bg-primary/30 mx-1" />
        <span className="text-xs font-semibold text-foreground truncate">{finalDestination.name.split(',')[0]}</span>
        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
      </div>
      <p className="text-sm text-muted-foreground mb-6">Baue deine Verbindung Schritt für Schritt</p>

      {/* Added legs */}
      {legs.length > 0 && (
        <div className="space-y-2 mb-6">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Deine Verbindung</p>
          {legs.map((leg, i) => {
            const style = getLineBadgeStyle(leg.departure.line.productName, leg.departure.line.name);
            return (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-[20px]" style={{ backgroundColor: '#111111', border: '1px solid #1F1F1F' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-display text-xl text-foreground">{formatTime(leg.departure.when)}</span>
                    <span
                      className="font-bold text-xs"
                      style={{ backgroundColor: style.bg, color: style.text, borderRadius: 6, padding: '6px 10px', fontSize: 12, fontWeight: 700 }}
                    >
                      {leg.departure.line.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {leg.origin.name.split(',')[0]} → {leg.departure.direction}
                  </p>
                </div>
                <button onClick={() => removeLeg(i)} className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Current search */}
      <div className="space-y-3 mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {legs.length === 0 ? 'Erste Verbindung wählen' : 'Nächsten Umstieg wählen'}
        </p>
        <p className="text-xs text-muted-foreground mb-1">Ab: <span className="text-foreground font-medium">{currentOrigin.name.split(',')[0]}</span> → Richtung <span className="text-foreground font-medium">{finalDestination.name.split(',')[0]}</span></p>

        {/* Umstiegsbahnhof: current origin with change option */}
        <div className="rounded-[20px] p-3 space-y-2" style={{ backgroundColor: '#111111', border: '1px solid #1F1F1F' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{legs.length === 0 ? 'Startbahnhof' : 'Umstieg an'}</p>
                <p className="text-sm font-semibold text-foreground">{currentOrigin.name.split(',')[0]}</p>
              </div>
            </div>
            <button
              onClick={() => { setShowStationSearch(!showStationSearch); setStationQuery(''); setStationResults([]); }}
              className="text-xs text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
            >
              {showStationSearch ? 'Schließen' : 'Ändern'}
            </button>
          </div>

          {showStationSearch && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #1A1A1A' }}>
              <input
                type="text"
                value={stationQuery}
                onChange={e => handleStationSearch(e.target.value)}
                placeholder="Anderen Umstiegsbahnhof suchen..."
                autoFocus
                className="w-full h-12 rounded-2xl px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary"
                style={{ backgroundColor: '#1A1A1A' }}
              />
              {stationLoading && (
                <div className="flex justify-center py-3">
                  <div className="amber-spinner" style={{ width: 18, height: 18 }} />
                </div>
              )}
              <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
                {stationResults.map(s => (
                  <button key={s.id} onClick={() => selectStation(s)} className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
                    <Train className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name.split(',')[0]}</p>
                      {s.name.includes(',') && <p className="text-xs text-muted-foreground">{s.name.split(',').slice(1).join(',').trim()}</p>}
                    </div>
                  </button>
                ))}
              </div>
              {!showStationSearch && legs.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-1">
                  Oder übernimm den vorgeschlagenen Bahnhof und suche direkt Abfahrten
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Ab wann?</label>
            <input
              type="time"
              value={departureTime}
              onChange={e => setDepartureTime(e.target.value)}
              className="w-full h-12 rounded-2xl px-4 text-sm text-foreground outline-none border border-transparent focus:border-primary transition-all"
              style={{ backgroundColor: '#1A1A1A' }}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={searchDepartures}
              disabled={loading}
              className="h-12 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="amber-spinner" style={{ width: 16, height: 16, borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> : <Search className="h-4 w-4" />}
              Suchen
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      {departures.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Filtern: Richtung oder Linie..."
            className="w-full h-11 rounded-2xl px-4 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary"
            style={{ backgroundColor: '#1A1A1A' }}
          />
        </div>
      )}

      {/* Departure results */}
      <div className="flex-1 overflow-y-auto space-y-1 pb-24">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="amber-spinner" />
          </div>
        )}

        {!loading && searched && departures.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Keine Abfahrten gefunden</p>
        )}

        {!loading && searched && filteredDepartures.length === 0 && departures.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Kein Treffer für "{filterText}"</p>
        )}

        {!loading && filteredDepartures.map((dep, i) => {
          const style = getLineBadgeStyle(dep.line.productName, dep.line.name);
          return (
            <button
              key={`${dep.tripId}-${i}`}
              onClick={() => addLeg(dep)}
              className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-card transition-colors"
              style={{ borderBottom: '1px solid #1A1A1A' }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xl text-foreground w-14">{formatTime(dep.when)}</span>
                <span
                  className="font-bold text-xs shrink-0"
                  style={{ backgroundColor: style.bg, color: style.text, borderRadius: 6, padding: '6px 10px', fontSize: 12, fontWeight: 700 }}
                >
                  {dep.line.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 ml-14">
                <span className="text-xs text-foreground font-medium">{currentOrigin.name.split(',')[0]}</span>
                <ArrowRight className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground truncate">{dep.direction}</span>
              </div>
              {dep.platform && <p className="text-[10px] text-muted-foreground mt-0.5 ml-14">Gleis {dep.platform}</p>}
            </button>
          );
        })}
      </div>

      {/* Save button */}
      {legs.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 px-5 py-4"
          style={{ backgroundColor: '#000000', borderTop: '1px solid #1A1A1A' }}
        >
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => onSave(buildJourney())}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-bold text-sm"
            >
              Verbindung mit {legs.length} Abschnitt{legs.length !== 1 ? 'en' : ''} speichern
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
