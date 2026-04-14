import { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, ArrowRight, Search, Train, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { searchStations, searchJourneys, formatTime } from '@/lib/transport-api';
import { getLineBadgeStyle } from '@/lib/line-colors';
import type { Station, Journey, Weekday } from '@/lib/types';
import { WEEKDAY_LABELS } from '@/lib/types';

interface ManualJourneyBuilderProps {
  initialOrigin: Station;
  finalDestination: Station;
  initialDays?: Weekday[];
  onSave: (journeys: Journey[], weekdays: Weekday[]) => void;
  onBack: () => void;
}

/** A single segment the user has added */
interface Segment {
  id: string;
  journey: Journey;
  from: Station;
  to: Station;
  lineSummary: string;
}

export function ManualJourneyBuilder({ initialOrigin, finalDestination, initialDays, onSave, onBack }: ManualJourneyBuilderProps) {
  // Completed segments
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedDays, setSelectedDays] = useState<Set<Weekday>>(new Set(initialDays || ['mon', 'tue', 'wed', 'thu', 'fri']));

  // Adding new segment state
  const [isAdding, setIsAdding] = useState(true);
  const [searchDirection, setSearchDirection] = useState<Station>(finalDestination);
  const [departureTime, setDepartureTime] = useState('07:00');
  const [journeyResults, setJourneyResults] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Station search for direction
  const [editingDirection, setEditingDirection] = useState(false);
  const [stationQuery, setStationQuery] = useState('');
  const [stationResults, setStationResults] = useState<Station[]>([]);
  const [stationLoading, setStationLoading] = useState(false);

  const currentFrom = segments.length > 0
    ? segments[segments.length - 1].to
    : initialOrigin;

  const searchConnections = useCallback(async () => {
    if (currentFrom.id === searchDirection.id) return;
    setLoading(true);
    setSearched(true);
    try {
      const now = new Date();
      const [h, m] = departureTime.split(':').map(Number);
      const when = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      if (when < now) when.setDate(when.getDate() + 1);

      const results = await searchJourneys(currentFrom.id, searchDirection.id, {
        departure: when.toISOString(),
        results: 10,
      });
      setJourneyResults(results);
    } catch {
      setJourneyResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentFrom.id, searchDirection.id, departureTime]);

  const handleStationSearch = useCallback(async (q: string) => {
    setStationQuery(q);
    if (q.length < 2) { setStationResults([]); return; }
    setStationLoading(true);
    const results = await searchStations(q);
    setStationResults(results);
    setStationLoading(false);
  }, []);

  const selectDirection = (station: Station) => {
    setSearchDirection(station);
    setEditingDirection(false);
    setStationQuery('');
    setStationResults([]);
    setJourneyResults([]);
    setSearched(false);
  };

  const addSegment = (journey: Journey) => {
    const firstLeg = journey.legs[0];
    const lastLeg = journey.legs[journey.legs.length - 1];
    if (!firstLeg || !lastLeg) return;

    const lineName = journey.legs.map(l => l.line?.name || l.line?.productName || '?').join(' → ');

    const segment: Segment = {
      id: `seg-${Date.now()}`,
      journey,
      from: firstLeg.origin,
      to: lastLeg.destination,
      lineSummary: lineName,
    };

    setSegments(prev => [...prev, segment]);
    setIsAdding(false);
    setJourneyResults([]);
    setSearched(false);
  };

  const removeSegment = (id: string) => {
    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      // Remove this and all subsequent segments (chain is broken)
      return prev.slice(0, idx);
    });
  };

  const startAddingNext = () => {
    setIsAdding(true);
    setSearchDirection(finalDestination);
    setJourneyResults([]);
    setSearched(false);
  };

  const handleFinish = () => {
    if (segments.length > 0) {
      onSave(segments.map(s => s.journey), Array.from(selectedDays));
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-2xl tracking-tight text-foreground">Route zusammenstellen</h1>
      </div>

      {/* Route overview */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">{initialOrigin.name.split(',')[0]}</span>
        <div className="flex-1 h-px bg-primary/30 mx-1" />
        <span className="text-xs font-semibold text-foreground truncate">{finalDestination.name.split(',')[0]}</span>
        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
      </div>

      {/* Weekday selection */}
      <div className="mb-4">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Pendeltage</label>
        <div className="flex gap-1.5">
          {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as Weekday[]).map(day => (
            <button
              key={day}
              onClick={() => setSelectedDays(prev => {
                const next = new Set(prev);
                next.has(day) ? next.delete(day) : next.add(day);
                return next;
              })}
              className={cn(
                'flex-1 h-10 rounded-xl text-xs font-bold transition-all border',
                selectedDays.has(day)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border'
              )}
            >
              {WEEKDAY_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      {/* Existing segments */}
      {segments.length > 0 && (
        <div className="mb-4 space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Deine Verbindungen ({segments.length})
          </label>
          {segments.map((seg, i) => {
            const firstLeg = seg.journey.legs[0];
            const lastLeg = seg.journey.legs[seg.journey.legs.length - 1];
            return (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-card border border-border relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">#{i + 1}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {seg.journey.legs.map((leg, li) => {
                          const s = getLineBadgeStyle(leg.line?.productName || '', leg.line?.name || '');
                          return (
                            <span
                              key={li}
                              style={{ backgroundColor: s.bg, color: s.text, borderRadius: 6, padding: '3px 7px', fontSize: 10, fontWeight: 700, lineHeight: 1 }}
                            >
                              {leg.line?.name || leg.line?.productName || '?'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {seg.from.name.split(',')[0]} → {seg.to.name.split(',')[0]}
                    </p>
                    {firstLeg && lastLeg && (
                      <p className="text-xs text-muted-foreground">
                        {formatTime(firstLeg.departure)} – {formatTime(lastLeg.arrival)} · {getDuration(seg.journey)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSegment(seg.id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {/* Connector line to next segment */}
                {i < segments.length - 1 && (
                  <div className="absolute -bottom-2 left-6 w-px h-2 bg-primary/30" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add segment section */}
      {!isAdding && (
        <button
          onClick={startAddingNext}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors mb-4"
        >
          <Plus className="h-4 w-4" />
          Weitere Verbindung hinzufügen
        </button>
      )}

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">
            {segments.length === 0 ? 'Erste Verbindung suchen' : 'Nächste Verbindung hinzufügen'}
          </label>

          {/* From → To card */}
          <div className="rounded-2xl p-3 bg-card border border-border mb-3">
            {/* From (fixed based on last segment) */}
            <div className="flex items-center gap-2 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ab</p>
                <p className="text-sm font-semibold text-foreground truncate">{currentFrom.name.split(',')[0]}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Direction (editable) */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Train className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Richtung</p>
                  <p className="text-sm font-semibold text-foreground truncate">{searchDirection.name.split(',')[0]}</p>
                </div>
              </div>
              <button
                onClick={() => { setEditingDirection(!editingDirection); setStationQuery(''); setStationResults([]); }}
                className="text-xs text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors shrink-0"
              >
                {editingDirection ? 'Schließen' : 'Ändern'}
              </button>
            </div>

            {/* Station search */}
            {editingDirection && (
              <div className="space-y-2 pt-2 border-t border-border">
                <input
                  type="text"
                  value={stationQuery}
                  onChange={e => handleStationSearch(e.target.value)}
                  placeholder="Zielbahnhof suchen..."
                  autoFocus
                  className="w-full h-12 rounded-2xl px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border bg-secondary focus:border-primary"
                />
                {stationLoading && (
                  <div className="flex justify-center py-3">
                    <div className="amber-spinner" style={{ width: 18, height: 18 }} />
                  </div>
                )}
                <div className="divide-y divide-border max-h-48 overflow-y-auto">
                  {stationResults.map(s => (
                    <button key={s.id} onClick={() => selectDirection(s)} className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
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

          {/* Time + Search */}
          <div className="flex gap-2 mb-3">
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

          {/* Results */}
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pb-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="amber-spinner" />
              </div>
            )}

            {!loading && searched && journeyResults.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Keine Verbindungen gefunden</p>
                <p className="text-xs text-muted-foreground mt-1">Ändere Richtung oder Uhrzeit</p>
              </div>
            )}

            {!loading && journeyResults.map(journey => {
              const firstLeg = journey.legs[0];
              const lastLeg = journey.legs[journey.legs.length - 1];
              if (!firstLeg || !lastLeg) return null;

              return (
                <button
                  key={journey.id}
                  onClick={() => addSegment(journey)}
                  className="w-full text-left p-3 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl text-foreground">{formatTime(firstLeg.departure)}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="font-display text-xl text-foreground">{formatTime(lastLeg.arrival)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{getDuration(journey)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    {firstLeg.origin.name.split(',')[0]} → {lastLeg.destination.name.split(',')[0]}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {journey.legs.map((leg, li) => {
                      const s = getLineBadgeStyle(leg.line?.productName || '', leg.line?.name || '');
                      return (
                        <span
                          key={li}
                          style={{ backgroundColor: s.bg, color: s.text, borderRadius: 6, padding: '4px 7px', fontSize: 10, fontWeight: 700, lineHeight: 1 }}
                        >
                          {leg.line?.name || leg.line?.productName || '?'}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cancel adding if segments exist */}
          {segments.length > 0 && (
            <button
              onClick={() => setIsAdding(false)}
              className="w-full text-center text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
            >
              Abbrechen
            </button>
          )}
        </motion.div>
      )}

      {/* Bottom bar */}
      {segments.length > 0 && !isAdding && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 flex items-center justify-between bg-background border-t border-border"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div>
            <span className="text-sm font-medium text-foreground">{segments.length} Verbindung{segments.length > 1 ? 'en' : ''}</span>
            <p className="text-xs text-muted-foreground">
              {segments[0].from.name.split(',')[0]} → {segments[segments.length - 1].to.name.split(',')[0]}
            </p>
          </div>
          <button
            onClick={handleFinish}
            className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2"
          >
            Weiter <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
