import { ArrowLeft, Check, Train, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Station, Journey } from '@/lib/types';
import { formatTime } from '@/lib/transport-api';

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
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-3rem)]"
    >
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <h1 className="font-display text-5xl tracking-tight text-foreground mb-2">ALLES BEREIT.</h1>
      <p className="text-sm text-muted-foreground mb-10">Deine Pendlerroute ist eingerichtet</p>

      {/* Checkmark animation */}
      <div className="flex justify-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="h-20 w-20 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
        </motion.div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-[20px] p-5 card-amber-border space-y-4 mb-10"
      >
        <div className="flex items-center gap-3">
          <Train className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {origin.name.split(',')[0]} → {destination.name.split(',')[0]}
            </p>
            {hasReturn && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <ArrowRightLeft className="h-3 w-3" /> inkl. Rückweg
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Verbindungen</p>
            <p className="font-display text-2xl text-foreground">{totalConnections}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Linien</p>
            <p className="font-display text-2xl text-foreground">{allLines.size}</p>
          </div>
        </div>

        {/* Show saved journeys */}
        {journeys.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Hinweg</p>
              {journeys.map((j, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5">
                  <span className="font-display text-lg text-foreground w-12">{formatTime(j.legs[0]?.departure)}</span>
                  <div className="flex gap-1 flex-wrap">
                    {j.legs.map((l, li) => (
                      <span key={li} className="bg-secondary text-foreground px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        {l.line?.name || '?'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {returnJourneys.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Rückweg</p>
              {returnJourneys.map((j, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5">
                  <span className="font-display text-lg text-foreground w-12">{formatTime(j.legs[0]?.departure)}</span>
                  <div className="flex gap-1 flex-wrap">
                    {j.legs.map((l, li) => (
                      <span key={li} className="bg-secondary text-foreground px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        {l.line?.name || '?'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      <button
        onClick={onFinish}
        className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all"
      >
        Pendly starten
      </button>
    </motion.div>
  );
}
