import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, X, ArrowLeft } from 'lucide-react';
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
      const params = new URLSearchParams({ query: q, results: '6', stops: 'true', addresses: 'false', poi: 'false', fuzzy: 'true' });
      const res = await fetch(`https://v6.db.transport.rest/locations?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(
        data
          .filter((l: any) => l.type === 'station' || l.type === 'stop')
          .map((l: any): Station => ({ id: l.id, name: l.name, type: l.type, products: l.products || {} }))
      );
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-4rem)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {onBack ? (
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : onCancel ? (
          <button onClick={onCancel} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : null}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Haltestelle suchen…"
          className="w-full h-12 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
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
          <div className="space-y-1">
            {results.map((station) => {
              const hint = getLocationHint(station);
              return (
                <button
                  key={station.id}
                  onClick={() => onSelect(station)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{station.name.split(',')[0]}</p>
                  {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
