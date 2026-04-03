import { useState } from 'react';
import { ArrowLeft, Train, TramFront, Bus as BusIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { TransportType } from '@/lib/types';

interface TransportOption {
  type: TransportType;
  label: string;
  icon: React.ReactNode;
}

const TRANSPORT_OPTIONS: TransportOption[] = [
  { type: 'nationalExpress', label: 'ICE/IC', icon: <Train className="h-5 w-5" /> },
  { type: 'regionalExpress', label: 'RE/RB', icon: <Train className="h-5 w-5" /> },
  { type: 'suburban', label: 'S-Bahn', icon: <Train className="h-5 w-5" /> },
  { type: 'subway', label: 'U-Bahn', icon: <TramFront className="h-5 w-5" /> },
  { type: 'bus', label: 'Bus', icon: <BusIcon className="h-5 w-5" /> },
  { type: 'tram', label: 'Tram', icon: <TramFront className="h-5 w-5" /> },
];

interface TransportStepProps {
  initialSelected?: TransportType[];
  onNext: (types: TransportType[]) => void;
  onBack: () => void;
}

export function TransportStep({ initialSelected = [], onNext, onBack }: TransportStepProps) {
  const [selected, setSelected] = useState<TransportType[]>(
    initialSelected.length > 0 ? initialSelected : ['regionalExpress', 'suburban']
  );

  const toggle = (t: TransportType) => {
    setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col min-h-[calc(100vh-4rem)]"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Womit fährst du?</h1>
          <p className="text-sm text-muted-foreground">Wähle deine Verkehrsmittel</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {TRANSPORT_OPTIONS.map(opt => {
          const isSelected = selected.includes(opt.type);
          return (
            <button
              key={opt.type}
              onClick={() => toggle(opt.type)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'card-amber-border bg-card text-muted-foreground hover:bg-secondary'
              )}
              style={isSelected ? { borderWidth: '1.5px', borderStyle: 'solid', borderColor: 'hsl(38 92% 50%)' } : {}}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              {opt.icon}
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pb-4">
        <Button
          onClick={() => onNext(selected)}
          disabled={selected.length === 0}
          className="w-full h-12 rounded-xl font-semibold text-sm"
        >
          Weiter
        </Button>
      </div>
    </motion.div>
  );
}
