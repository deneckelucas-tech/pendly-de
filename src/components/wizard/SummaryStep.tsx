import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Station, Journey, Weekday } from '@/lib/types';
import { formatTime } from '@/lib/transport-api';
import { getLineBadgeStyle } from '@/lib/line-colors';
import { createRoute } from '@/lib/routes-service';
import { toast } from '@/hooks/use-toast';

interface SummaryStepProps {
  origin: Station;
  destination: Station;
  journeys: Journey[];
  returnJourneys: Journey[];
  hasReturn: boolean;
  weekdays: Weekday[];
  onFinish: () => void;
  onBack: () => void;
}

export function SummaryStep({ origin, destination, journeys, returnJourneys, hasReturn, weekdays, onFinish, onBack }: SummaryStepProps) {
  const [saving, setSaving] = useState(false);
  const totalConnections = journeys.length + returnJourneys.length;
  const allLines = new Set<string>();
  [...journeys, ...returnJourneys].forEach(j => {
    j.legs.forEach(l => {
      if (l.line?.name) allLines.add(l.line.name);
    });
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const shortOrigin = origin.name.split(',')[0];
      const shortDest = destination.name.split(',')[0];
      const routeName = `${shortOrigin} → ${shortDest}`;
      await createRoute({
        name: routeName,
        origin,
        destination,
        outboundJourneys: journeys,
        returnJourneys: hasReturn ? returnJourneys : [],
        weekdays,
      });
      toast({
        title: 'Route gespeichert',
        description: 'Pendly überwacht deine Strecke ab jetzt.',
      });
      onFinish();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      toast({
        title: 'Speichern fehlgeschlagen',
        description: message,
        variant: 'destructive',
      });
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex items-center mb-4">
        <button onClick={onBack} disabled={saving} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex justify-center mb-5"
      >
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
      </motion.div>

      <h1 className="font-display tracking-tight text-foreground text-center mb-1" style={{ fontSize: 36, lineHeight: 1.1 }}>
        Alles bereit.
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Pendly überwacht ab jetzt deine Strecke.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 mb-6"
      >
        <div className="flex-1 rounded-[16px] bg-card border border-border p-4 text-center shadow-sm">
          <p className="font-display text-primary" style={{ fontSize: 32, lineHeight: 1 }}>{totalConnections}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Verbindungen</p>
        </div>
        <div className="flex-1 rounded-[16px] bg-card border border-border p-4 text-center shadow-sm">
          <p className="font-display text-primary" style={{ fontSize: 32, lineHeight: 1 }}>{allLines.size}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Linien</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 mb-auto"
      >
        {journeys.length > 0 && (
          <div className="rounded-[20px] p-4 bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">
              Hinweg · {origin.name.split(',')[0]} → {destination.name.split(',')[0]}
            </p>
            <div className="space-y-2">
              {journeys.map((j, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="font-display text-lg text-foreground w-12">{formatTime(j.legs[0]?.departure)}</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {j.legs.filter(l => l.line && l.line.productName !== 'walking').map((l, li) => {
                      const s = getLineBadgeStyle(l.line?.productName || '', l.line?.name || '');
                      return (
                        <span key={li} style={{ backgroundColor: s.bg, color: s.text, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
                          {l.line?.name || '?'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasReturn && returnJourneys.length > 0 && (
          <div className="rounded-[20px] p-4 bg-card border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">
              Rückweg · {destination.name.split(',')[0]} → {origin.name.split(',')[0]}
            </p>
            <div className="space-y-2">
              {returnJourneys.map((j, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="font-display text-lg text-foreground w-12">{formatTime(j.legs[0]?.departure)}</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {j.legs.filter(l => l.line && l.line.productName !== 'walking').map((l, li) => {
                      const s = getLineBadgeStyle(l.line?.productName || '', l.line?.name || '');
                      return (
                        <span key={li} style={{ backgroundColor: s.bg, color: s.text, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
                          {l.line?.name || '?'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="pt-6 pb-4"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ boxShadow: '0 8px 32px rgba(30,78,216,0.20)' }}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Speichere…
            </>
          ) : (
            <>
              Los geht's – Pendly starten
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
