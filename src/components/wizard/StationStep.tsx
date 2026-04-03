import { useState, useEffect, useRef, useCallback } from 'react';
import { searchStations } from '@/lib/transport-api';
import { ArrowLeft, X, Train } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Station } from '@/lib/types';

interface StationStepProps {
  title: string;
  subtitle: string;
  onSelect: (station: Station) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

export function StationStep({ title, subtitle, onSelect, onBack, onCancel }: StationStepProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
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

  const getLocationHint = (station: Station): string | null => {
    const parts = station.name.split(',');
    return parts.length > 1 ? parts.slice(1).join(',').trim() : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-3rem)]"
    >
      {/* Nav */}
      <div className="flex items-center gap-3 mb-8">
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

      {/* Title */}
      <h1 className="font-display text-4xl tracking-tight text-foreground mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Haltestelle suchen..."
          className="w-full h-14 rounded-2xl px-5 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all border border-transparent focus:border-primary"
          style={{ backgroundColor: '#1A1A1A' }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="amber-spinner" style={{ width: 18, height: 18 }} />
          </div>
        )}
      </div>

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
          <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
            {results.map((station) => {
              const hint = getLocationHint(station);
              return (
                <button
                  key={station.id}
                  onClick={() => onSelect(station)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-card transition-colors group"
                  style={{ borderColor: '#1A1A1A' }}
                >
                  <Train className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0 border-l-2 border-transparent group-active:border-primary pl-3 transition-colors">
                    <p className="text-base font-semibold text-foreground">{station.name.split(',')[0]}</p>
                    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
