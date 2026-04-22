import { useState, useCallback } from 'react';
import { searchJourneys } from '@/lib/transport-api';
import { fetchUserRoutes } from '@/lib/routes-service';
import { Bug, RefreshCw, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugEntry {
  routeId: string;
  routeName: string;
  fromId: string;
  toId: string;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
  rawResponse?: unknown;
  journeyCount?: number;
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const isProd = import.meta.env.PROD;

  const fetchAll = useCallback(async () => {
    if (isProd) return;
    setLoading(true);
    const routes = await fetchUserRoutes();
    const results: DebugEntry[] = [];

    for (const route of routes) {
      const fromId = route.origin.id;
      const toId = route.destination.id;
      try {
        const res = await fetch(
          `https://v6.db.transport.rest/journeys?from=${fromId}&to=${toId}&results=3&stopovers=false&language=de`
        );
        const raw = await res.json();
        const journeys = await searchJourneys(fromId, toId, { results: 3 });
        results.push({
          routeId: route.id,
          routeName: route.name,
          fromId,
          toId,
          timestamp: new Date().toISOString(),
          status: 'success',
          rawResponse: raw,
          journeyCount: journeys.length,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({
          routeId: route.id,
          routeName: route.name,
          fromId,
          toId,
          timestamp: new Date().toISOString(),
          status: 'error',
          error: message,
        });
      }
    }

    setEntries(results);
    setLoading(false);
  }, [isProd]);

  const lastSuccess = entries.find(e => e.status === 'success');

  if (isProd) return null;

  return (
    <div className="fixed bottom-20 right-3 z-50" style={{ maxWidth: 'calc(100vw - 24px)' }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="h-10 w-10 rounded-full bg-card border border-amber-500/20 flex items-center justify-center shadow-lg"
        >
          <Bug className="h-4 w-4 text-amber-500" />
        </button>
      ) : (
        <div className="w-[360px] max-h-[70vh] bg-card border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">HAFAS Debug</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="h-7 px-3 rounded-lg bg-amber-500/15 text-amber-500 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
                Fetch
              </button>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Last fetch info */}
          {lastSuccess && (
            <div className="px-4 py-2 border-b border-border text-[11px] text-muted-foreground">
              Letzter Fetch: {new Date(lastSuccess.timestamp).toLocaleTimeString('de-DE')}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {entries.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Klicke "Fetch" um die HAFAS API für alle gespeicherten Routen abzufragen.
              </p>
            )}
            {entries.map((entry) => (
              <div key={entry.routeId} className="bg-secondary/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedEntry(expandedEntry === entry.routeId ? null : entry.routeId)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                >
                  {entry.status === 'success' ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{entry.routeName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.fromId} → {entry.toId}
                      {entry.journeyCount !== undefined && ` · ${entry.journeyCount} Verbindungen`}
                    </p>
                  </div>
                  {expandedEntry === entry.routeId ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {expandedEntry === entry.routeId && (
                  <div className="px-3 pb-3">
                    {entry.error && (
                      <div className="text-[11px] text-red-400 bg-red-500/10 rounded-lg p-2 mb-2">
                        {entry.error}
                      </div>
                    )}
                    {entry.rawResponse && (
                      <pre className="text-[10px] text-muted-foreground bg-background rounded-lg p-2 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(entry.rawResponse, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
