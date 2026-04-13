import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Station, Journey } from '@/lib/types';
import { formatTime } from '@/lib/transport-api';
import { getLineBadgeStyle } from '@/lib/line-colors';

interface SummaryStepProps {
  origin: Station;
  destination: Station;
  journeys: Journey[];
  returnJourneys: Journey[];
  hasReturn: boolean;
  onFinish: () => void;
  onBack: () => void;
}

export function SummaryStep({ origin, destination, journeys, returnJourneys, hasReturn, onFinish, onBack }: SummaryStepProps) {
  const totalConnections = journeys.length + returnJourneys.length;
  const allLines = new Set<string>();
  [...journeys, ...returnJourneys].forEach(j => {
    j.legs.forEach(l => {
      if (l.line?.name) allLines.add(l.line.name);
    });
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Back */}
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Success animation */}
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

      {/* Stats */}
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

      {/* Journey summary cards */}
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

        {returnJourneys.length > 0 && (
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

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="pt-6 pb-4"
      >
        <button
          onClick={onFinish}
          className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all flex items-center justify-center gap-2"
          style={{ boxShadow: '0 8px 32px rgba(30,78,216,0.20)' }}
        >
          Los geht's – Pendly starten
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
