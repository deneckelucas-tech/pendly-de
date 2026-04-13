import { useState, useEffect, useRef, useCallback } from 'react';
import { searchStations } from '@/lib/transport-api';
import { ArrowLeft, X, MapPin, Clock, ArrowRight, Train, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Station } from '@/lib/types';

interface StationStepProps {
  title?: string;
  subtitle?: string;
  onSelect?: (station: Station) => void;
  onStationsSelected?: (origin: Station, destination: Station) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

const RECENT_STATIONS_KEY = 'pendly_recent_stations';

function getRecentStations(): Station[] {
  try {
    const raw = localStorage.getItem(RECENT_STATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).slice(0, 5);
  } catch { return []; }
}

function saveRecentStation(station: Station) {
  try {
    const existing = getRecentStations().filter(s => s.id !== station.id);
    existing.unshift(station);
    localStorage.setItem(RECENT_STATIONS_KEY, JSON.stringify(existing.slice(0, 5)));
  } catch { /* noop */ }
}

export function StationStep({ onStationsSelected, onBack, onCancel }: StationStepProps) {
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [activeField, setActiveField] = useState<'origin' | 'destination'>('origin');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentStations] = useState<Station[]>(getRecentStations);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeField]);

  const fetchStations = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setError(false);
    setSearched(true);
    try {
      const stations = await searchStations(q);
      setResults(stations);
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStations(value), 300);
  };

  const handleSelect = (station: Station) => {
    saveRecentStation(station);
    if (activeField === 'origin') {
      setOrigin(station);
      setActiveField('destination');
      setQuery('');
      setResults([]);
      setSearched(false);
    } else {
      setDestination(station);
      setQuery('');
      setResults([]);
      setSearched(false);
    }
  };

  const handleContinue = () => {
    if (origin && destination && onStationsSelected) {
      onStationsSelected(origin, destination);
    }
  };

  const getLocationHint = (station: Station): string | null => {
    const parts = station.name.split(',');
    return parts.length > 1 ? parts.slice(1).join(',').trim() : null;
  };

  const showRecent = !searched && recentStations.length > 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      {/* Nav */}
      <div className="flex items-center gap-3 mb-4">
        {onBack ? (
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : onCancel ? (
          <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display tracking-tight text-foreground mb-1" style={{ fontSize: 36, lineHeight: 1.1 }}>
          Deine Pendelstrecke
        </h1>
        <p className="text-sm text-muted-foreground">Wohin pendelst du täglich?</p>
      </div>

      {/* Route card */}
      <div className="rounded-[20px] border border-border bg-card shadow-sm overflow-hidden mb-5">
        {/* Origin field */}
        <button
          onClick={() => { setActiveField('origin'); setQuery(origin ? '' : ''); setResults([]); setSearched(false); }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-4 text-left transition-colors',
            activeField === 'origin' ? 'bg-primary/5' : ''
          )}
        >
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
            origin ? 'bg-primary/15' : 'bg-secondary'
          )}>
            <div className="h-3 w-3 rounded-full bg-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Start</p>
            {origin ? (
              <p className="text-sm font-bold text-foreground truncate">{origin.name.split(',')[0]}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Haltestelle wählen...</p>
            )}
          </div>
          {origin && (
            <button
              onClick={(e) => { e.stopPropagation(); setOrigin(null); setActiveField('origin'); setQuery(''); setResults([]); setSearched(false); }}
              className="p-1 rounded-full hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </button>

        {/* Divider with arrow */}
        <div className="relative px-4">
          <div className="h-px bg-border" />
          <div className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Destination field */}
        <button
          onClick={() => { setActiveField('destination'); setQuery(destination ? '' : ''); setResults([]); setSearched(false); }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-4 text-left transition-colors',
            activeField === 'destination' ? 'bg-primary/5' : ''
          )}
        >
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
            destination ? 'bg-primary/15' : 'bg-secondary'
          )}>
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ziel</p>
            {destination ? (
              <p className="text-sm font-bold text-foreground truncate">{destination.name.split(',')[0]}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Haltestelle wählen...</p>
            )}
          </div>
          {destination && (
            <button
              onClick={(e) => { e.stopPropagation(); setDestination(null); setActiveField('destination'); setQuery(''); setResults([]); setSearched(false); }}
              className="p-1 rounded-full hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </button>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={activeField === 'origin' ? 'Starthaltestelle suchen...' : 'Zielhaltestelle suchen...'}
          className="w-full rounded-2xl text-foreground placeholder:text-muted-foreground outline-none transition-all border border-border bg-card focus:border-primary shadow-sm"
          style={{ height: 56, fontSize: 16, paddingLeft: 20, paddingRight: 48 }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="amber-spinner" style={{ width: 20, height: 20 }} />
          </div>
        )}
      </div>

      {/* Recent stations */}
      {showRecent && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Zuletzt verwendet</p>
          <div className="flex gap-2 flex-wrap">
            {recentStations.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-foreground bg-card border border-border hover:border-primary transition-colors"
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
                {s.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <button onClick={() => fetchStations(query)} className="w-full text-center py-8">
            <p className="text-sm text-destructive font-medium mb-1">Verbindung fehlgeschlagen</p>
            <p className="text-xs text-muted-foreground">Tippe zum Wiederholen</p>
          </button>
        )}

        {!error && searched && !loading && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Keine Haltestelle gefunden</p>
        )}

        {results.length > 0 && (
          <div className="rounded-[16px] border border-border bg-card overflow-hidden">
            {results.map((station, i) => {
              const hint = getLocationHint(station);
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors group active:bg-secondary/50 hover:bg-secondary/30"
                  style={{ borderBottom: i < results.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}
                >
                  <Train className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{station.name.split(',')[0]}</p>
                    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Continue button */}
      <AnimatePresence>
        {origin && destination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pt-4 pb-4"
          >
            <button
              onClick={handleContinue}
              className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all flex items-center justify-center gap-2 shadow-md"
              style={{ boxShadow: '0 8px 32px rgba(30,78,216,0.20)' }}
            >
              Verbindungen suchen
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
