import { useState, useEffect, useRef, useCallback } from 'react';
import { searchStations } from '@/lib/transport-api';
import { ArrowLeft, X, MapPin, Clock } from 'lucide-react';
import type { Station } from '@/lib/types';

interface StationStepProps {
  title: string;
  subtitle: string;
  onSelect: (station: Station) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

const RECENT_STATIONS_KEY = 'pendly_recent_stations';

function getRecentStations(): Station[] {
  try {
    const raw = localStorage.getItem(RECENT_STATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).slice(0, 3);
  } catch { return []; }
}

function saveRecentStation(station: Station) {
  try {
    const existing = getRecentStations().filter(s => s.id !== station.id);
    existing.unshift(station);
    localStorage.setItem(RECENT_STATIONS_KEY, JSON.stringify(existing.slice(0, 5)));
  } catch { /* noop */ }
}

export function StationStep({ title, subtitle, onSelect, onBack, onCancel }: StationStepProps) {
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
  }, []);

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
    onSelect(station);
  };

  const getLocationHint = (station: Station): string | null => {
    const parts = station.name.split(',');
    return parts.length > 1 ? parts.slice(1).join(',').trim() : null;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      {/* Nav */}
      <div className="flex items-center gap-3 mb-6">
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

      {/* Icon */}
      <MapPin className="h-12 w-12 text-primary mb-4" strokeWidth={1.5} />

      {/* Title */}
      <h1 className="font-display tracking-tight text-foreground mb-1" style={{ fontSize: 52, lineHeight: 1 }}>{title}</h1>
      <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

      {/* Search Input */}
      <div className="relative mb-5">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Haltestelle suchen..."
          className="w-full rounded-2xl text-foreground placeholder:text-muted-foreground outline-none transition-all border border-transparent focus:border-primary"
          style={{ backgroundColor: '#1A1A1A', height: 60, fontSize: 18, paddingLeft: 20, paddingRight: 48 }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="amber-spinner" style={{ width: 20, height: 20 }} />
          </div>
        )}
      </div>

      {/* Recent stations chips */}
      {!searched && recentStations.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Schnellauswahl</p>
          <div className="flex gap-2 flex-wrap">
            {recentStations.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-foreground hover:opacity-80 transition-opacity"
                style={{ backgroundColor: '#1A1A1A' }}
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
                {s.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1">
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
          <div>
            {results.map((station, i) => {
              const hint = getLocationHint(station);
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className="w-full text-left px-3 py-3.5 flex items-center gap-3 transition-colors group active:bg-card"
                  style={{ borderBottom: i < results.length - 1 ? '1px solid #1A1A1A' : 'none' }}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0 border-l-2 border-transparent group-active:border-primary pl-3 transition-colors">
                    <p className="text-sm font-bold text-foreground">{station.name.split(',')[0]}</p>
                    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
