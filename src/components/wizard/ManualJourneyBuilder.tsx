import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Trash2, MapPin, ArrowRight, Search, Train, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { searchStations, searchJourneys, formatTime } from '@/lib/transport-api';
import { getLineBadgeStyle } from '@/lib/line-colors';
import type { Station, Journey, JourneyLeg, Weekday } from '@/lib/types';
import { WEEKDAY_LABELS } from '@/lib/types';

interface ManualJourneyBuilderProps {
  initialOrigin: Station;
  finalDestination: Station;
  initialDays?: Weekday[];
  onSave: (journeys: Journey[], weekdays: Weekday[]) => void;
  onBack: () => void;
}

export function ManualJourneyBuilder({ initialOrigin, finalDestination, initialDays, onSave, onBack }: ManualJourneyBuilderProps) {
  const [selectedJourneys, setSelectedJourneys] = useState<Journey[]>([]);
  const [currentOrigin, setCurrentOrigin] = useState<Station>(initialOrigin);
  const [currentDirection, setCurrentDirection] = useState<Station>(finalDestination);
  const [departureTime, setDepartureTime] = useState('07:00');
  const [journeyResults, setJourneyResults] = useState<Journey[]>([]);
  const [selectedDays, setSelectedDays] = useState<Set<Weekday>>(new Set(initialDays || ['mon', 'tue', 'wed', 'thu', 'fri']));
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [editingField, setEditingField] = useState<'origin' | 'direction' | null>(null);
  const [stationQuery, setStationQuery] = useState('');
  const [stationResults, setStationResults] = useState<Station[]>([]);
  const [stationLoading, setStationLoading] = useState(false);

  useEffect(() => {
    if (currentOrigin.id !== currentDirection.id) {
      searchConnections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchConnections = useCallback(async () => {
    if (currentOrigin.id === currentDirection.id) {
      setJourneyResults([]);
      setSearched(true);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const now = new Date();
      const [h, m] = departureTime.split(':').map(Number);
      const when = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      if (when < now) when.setDate(when.getDate() + 1);

      const results = await searchJourneys(currentOrigin.id, currentDirection.id, {
        departure: when.toISOString(),
        results: 15,
      });
      setJourneyResults(results);
    } catch {
      setJourneyResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrigin.id, currentDirection.id, departureTime]);

  const handleStationSearch = useCallback(async (q: string) => {
    setStationQuery(q);
    if (q.length < 2) { setStationResults([]); return; }
    setStationLoading(true);
    const results = await searchStations(q);
    setStationResults(results);
    setStationLoading(false);
  }, []);

  const selectStation = (station: Station) => {
    if (editingField === 'direction') {
      setCurrentDirection(station);
    } else {
      setCurrentOrigin(station);
    }
    setEditingField(null);
    setStationQuery('');
    setStationResults([]);
    setJourneyResults([]);
    setSearched(false);
  };

  const toggleJourney = (journey: Journey) => {
    setSelectedJourneys(prev => {
      const exists = prev.find(j => j.id === journey.id);
      if (exists) return prev.filter(j => j.id !== journey.id);
      return [...prev, journey];
    });
  };

  const handleFinish = () => {
    if (selectedJourneys.length > 0) {
      onSave(selectedJourneys, Array.from(selectedDays));
    }
  };

  const getDuration = (journey: Journey): string => {
    if (journey.legs.length === 0) return '';
    const dep = new Date(journey.legs[0].departure);
    const arr = new Date(journey.legs[journey.legs.length - 1].arrival);
    const mins = Math.round((arr.getTime() - dep.getTime()) / 60000);
    if (mins < 60) return `${mins} Min.`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const filteredJourneys = journeyResults.filter(j => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return j.legs.some(l =>
      l.line?.name?.toLowerCase().includes(q) ||
      l.line?.productName?.toLowerCase().includes(q) ||
      l.origin.name.toLowerCase().includes(q) ||
      l.destination.name.toLowerCase().includes(q)
    );
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
      <p className="text-sm text-muted-foreground mb-4">Wähle eine Verbindung von Ab nach Richtung</p>

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
                className={cn(
                  'flex-1 h-10 rounded-xl text-xs font-bold transition-all border',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border'
                )}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-field station picker: Ab + Richtung */}
      <div className="rounded-[20px] p-3 space-y-0 mb-4 bg-card border border-border">
        {/* Ab (origin) */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ab</p>
              <p className="text-sm font-semibold text-foreground truncate">{currentOrigin.name.split(',')[0]}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingField(editingField === 'origin' ? null : 'origin'); setStationQuery(''); setStationResults([]); }}
            className="text-xs text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors shrink-0"
          >
            {editingField === 'origin' ? 'Schließen' : 'Ändern'}
          </button>
        </div>

        <div className="h-px bg-border" />

        {/* Richtung (direction/destination) */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Richtung</p>
              <p className="text-sm font-semibold text-foreground truncate">{currentDirection.name.split(',')[0]}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingField(editingField === 'direction' ? null : 'direction'); setStationQuery(''); setStationResults([]); }}
            className="text-xs text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors shrink-0"
          >
            {editingField === 'direction' ? 'Schließen' : 'Ändern'}
          </button>
        </div>

        {/* Search overlay */}
        {editingField && (
          <div className="space-y-2 pt-2 border-t border-border">
            <input
              type="text"
              value={stationQuery}
              onChange={e => handleStationSearch(e.target.value)}
              placeholder={editingField === 'origin' ? 'Abfahrtsbahnhof suchen...' : 'Zielbahnhof suchen...'}
              autoFocus
              className="w-full h-12 rounded-2xl px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border bg-secondary focus:border-primary"
            />
            {stationLoading && (
              <div className="flex justify-center py-3">
                <div className="amber-spinner" style={{ width: 18, height: 18 }} />
              </div>
            )}
            <div className="divide-y divide-border">
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
          </div>
        )}
      </div>

      {/* Time + Search button */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Ab wann?</label>
          <input
            type="time"
            value={departureTime}
            onChange={e => setDepartureTime(e.target.value)}
            className="w-full h-12 rounded-2xl px-4 text-sm text-foreground outline-none border border-border bg-card focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={searchConnections}
            disabled={loading}
            className="h-12 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="amber-spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : <Search className="h-4 w-4" />}
            Suchen
          </button>
        </div>
      </div>

      {/* Filter */}
      {journeyResults.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Filtern: Linie oder Bahnhof..."
            className="w-full h-11 rounded-2xl px-4 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-border bg-card focus:border-primary"
          />
        </div>
      )}

      {/* Journey results */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pb-24">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="amber-spinner" />
          </div>
        )}

        {!loading && searched && journeyResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">Keine Verbindungen gefunden</p>
            <p className="text-xs text-muted-foreground">Ändere Ab oder Richtung und suche erneut</p>
          </div>
        )}

        {!loading && searched && filteredJourneys.length === 0 && journeyResults.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Kein Treffer für "{filterText}"</p>
          </div>
        )}

        {!loading && filteredJourneys.map((journey, i) => {
          const firstLeg = journey.legs[0];
          const lastLeg = journey.legs[journey.legs.length - 1];
          if (!firstLeg || !lastLeg) return null;
          const transfers = journey.legs.length - 1;

          return (
            <button
              key={journey.id}
              onClick={() => toggleJourney(journey)}
              className={cn(
                'w-full text-left p-4 rounded-[20px] transition-all active:scale-[0.99] relative border',
                selectedJourneys.find(j => j.id === journey.id)
                  ? 'bg-primary/5 border-primary'
                  : 'bg-card border-border'
              )}
            >
              {/* Times */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl text-foreground">{formatTime(firstLeg.departure)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  <span className="font-display text-2xl text-foreground">{formatTime(lastLeg.arrival)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{getDuration(journey)}</span>
              </div>

              {/* Route: origin → destination */}
              <p className="text-xs text-muted-foreground mb-2">
                {firstLeg.origin.name.split(',')[0]} → {lastLeg.destination.name.split(',')[0]}
              </p>

              {/* Line badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {journey.legs.map((leg, li) => {
                  const s = getLineBadgeStyle(leg.line?.productName || '', leg.line?.name || '');
                  return (
                    <span
                      key={li}
                      style={{
                        backgroundColor: s.bg,
                        color: s.text,
                        borderRadius: 6,
                        padding: '5px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {leg.line?.name || leg.line?.productName || '?'}
                    </span>
                  );
                })}
              </div>

              {/* Transfers */}
              {transfers > 0 && (
                <div className="flex items-center gap-1">
                  <Repeat className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{transfers}x Umstieg</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom bar */}
      {selectedJourneys.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 flex items-center justify-between bg-background border-t border-border">
          <span className="text-sm text-muted-foreground">{selectedJourneys.length} Verbindung{selectedJourneys.length > 1 ? 'en' : ''} gewählt</span>
          <button
            onClick={handleFinish}
            className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2"
          >
            Weiter <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
