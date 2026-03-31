import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { searchStations } from '@/lib/transport-api';
import type { Station } from '@/lib/types';
import { MapPin, Loader2, Train } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StationSearchProps {
  label?: string;
  placeholder?: string;
  value: Station | null;
  onChange: (station: Station | null) => void;
}

export function StationSearch({ label, placeholder = 'Bahnhof suchen...', value, onChange }: StationSearchProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    onChange(null); // clear selected station when typing

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const stations = await searchStations(q);
      setResults(stations);
      setOpen(stations.length > 0);
      setLoading(false);
    }, 300);
  };

  const handleSelect = (station: Station) => {
    onChange(station);
    setQuery(station.name);
    setOpen(false);
  };

  const getProductTags = (station: Station) => {
    const tags: string[] = [];
    const p = station.products;
    if (p.nationalExpress || p.national) tags.push('ICE/IC');
    if (p.regionalExpress) tags.push('RE');
    if (p.regional) tags.push('RB');
    if (p.suburban) tags.push('S');
    if (p.subway) tags.push('U');
    if (p.tram) tags.push('Tram');
    if (p.bus) tags.push('Bus');
    return tags;
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="text-sm font-medium mb-1.5 block">{label}</label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn('pl-9 pr-9', value && 'border-primary/50 bg-primary/[0.03]')}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
        {value && !loading && <Train className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map(station => (
            <button
              key={station.id}
              type="button"
              onClick={() => handleSelect(station)}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left border-b last:border-0"
            >
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{station.name}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {getProductTags(station).map(tag => (
                    <span key={tag} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
