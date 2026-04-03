import { ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)]">
      {/* Back button top-left */}
      <div className="w-full flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Animated checkmark ring */}
      <div className="flex justify-center mb-8">
        <div className="relative h-24 w-24">
          {/* Amber ring drawing animation */}
          <motion.svg
            viewBox="0 0 96 96"
            className="absolute inset-0 h-24 w-24"
          >
            <motion.circle
              cx="48" cy="48" r="44"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ transformOrigin: 'center' }}
            />
          </motion.svg>
          {/* Checkmark inside */}
          <motion.svg
            viewBox="0 0 96 96"
            className="absolute inset-0 h-24 w-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <motion.polyline
              points="30,50 44,64 66,36"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.7, duration: 0.4, ease: 'easeOut' }}
            />
          </motion.svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display tracking-tight text-foreground text-center mb-6" style={{ fontSize: 56, lineHeight: 1 }}>ALLES BEREIT.</h1>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-8 mb-8"
      >
        <div className="text-center">
          <p className="font-display text-primary" style={{ fontSize: 48, lineHeight: 1 }}>{totalConnections}</p>
          <p className="text-xs text-muted-foreground mt-1">Verbindungen</p>
        </div>
        <div className="text-center">
          <p className="font-display text-primary" style={{ fontSize: 48, lineHeight: 1 }}>{allLines.size}</p>
          <p className="text-xs text-muted-foreground mt-1">Linien</p>
        </div>
      </motion.div>

      {/* Journey summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full space-y-4 mb-10"
      >
        {journeys.length > 0 && (
          <div className="rounded-[20px] p-4" style={{ backgroundColor: '#111111', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Hinweg</p>
            {journeys.map((j, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <span className="font-display text-lg text-foreground w-12">{formatTime(j.legs[0]?.departure)}</span>
                <div className="flex gap-1 flex-wrap">
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
        )}

        {returnJourneys.length > 0 && (
          <div className="rounded-[20px] p-4" style={{ backgroundColor: '#111111', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Rückweg</p>
            {returnJourneys.map((j, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <span className="font-display text-lg text-foreground w-12">{formatTime(j.legs[0]?.departure)}</span>
                <div className="flex gap-1 flex-wrap">
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
        )}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full"
      >
        <button
          onClick={onFinish}
          className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all flex items-center justify-center gap-2"
        >
          Los geht's – Pendly starten
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
