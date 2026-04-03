import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/lib/transport-api';
import type { Station, TransportType, Journey } from '@/lib/types';
import { TRANSPORT_LABELS } from '@/lib/types';

interface SaveStepProps {
  origin: Station;
  destination: Station;
  transportTypes: TransportType[];
  journeys: Journey[];
  onSave: (name: string) => void;
  onBack: () => void;
}

export function SaveStep({ origin, destination, transportTypes, journeys, onSave, onBack }: SaveStepProps) {
  const [name, setName] = useState('Zur Arbeit');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => onSave(name), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-4rem)]"
    >
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="h-16 w-16 rounded-full bg-status-ontime flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Route gespeichert!</h2>
            <p className="text-sm text-muted-foreground">{name}</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} className="flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Wie heißt diese Route?</h1>
                <p className="text-sm text-muted-foreground">Gib deiner Route einen Namen</p>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="z.B. Zur Arbeit"
                className="w-full h-12 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
              />
            </div>

            {/* Summary Card */}
            <div className="card-amber-border bg-card rounded-2xl p-4 mb-auto">
              <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mb-3 font-semibold">Zusammenfassung</p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium text-foreground">{origin.name}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{destination.name}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {transportTypes.map(t => (
                  <span key={t} className="text-[10px] font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">
                    {TRANSPORT_LABELS[t]}
                  </span>
                ))}
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {journeys.length} Verbindung{journeys.length !== 1 ? 'en' : ''} ausgewählt
                </p>
                <div className="space-y-1.5">
                  {journeys.slice(0, 4).map(j => {
                    const first = j.legs[0];
                    const last = j.legs[j.legs.length - 1];
                    const lines = j.legs.map(l => l.line?.name || '?').join(' → ');
                    return (
                      <div key={j.id} className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-foreground">{formatTime(first.departure)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold text-foreground">{formatTime(last.arrival)}</span>
                        <span className="text-muted-foreground ml-auto">{lines}</span>
                      </div>
                    );
                  })}
                  {journeys.length > 4 && (
                    <p className="text-[10px] text-muted-foreground">+{journeys.length - 4} weitere</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pb-4">
              <Button
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full h-12 rounded-xl font-semibold text-sm"
              >
                Route speichern
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
