import { useState } from 'react';
import { ArrowLeft, MapPin, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ReturnStepProps {
  onSelect: (wantsReturn: boolean) => void;
  onBack: () => void;
}

export function ReturnStep({ onSelect, onBack }: ReturnStepProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

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

      <h1 className="font-display text-4xl tracking-tight text-foreground mb-2">HAST DU EINEN RÜCKWEG?</h1>
      <p className="text-sm text-muted-foreground mb-10">Möchtest du auch deinen Rückweg überwachen?</p>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <button
          onClick={() => setSelected(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] transition-all text-center',
            selected === true
              ? 'bg-primary/10 border border-primary'
              : 'bg-card card-amber-border hover:bg-secondary/50'
          )}
        >
          <RotateCcw className={cn('h-7 w-7', selected === true ? 'text-primary' : 'text-muted-foreground')} />
          <div>
            <p className="text-sm font-semibold text-foreground">Ja, festen Rückweg</p>
          </div>
        </button>
        <button
          onClick={() => setSelected(false)}
          className={cn(
            'flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] transition-all text-center',
            selected === false
              ? 'bg-primary/10 border border-primary'
              : 'bg-card card-amber-border hover:bg-secondary/50'
          )}
        >
          <MapPin className={cn('h-7 w-7', selected === false ? 'text-primary' : 'text-muted-foreground')} />
          <div>
            <p className="text-sm font-semibold text-foreground">Nein, reicht erstmal</p>
          </div>
        </button>
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => onSelect(selected)}
            className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all"
          >
            Weiter
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
