import { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ReturnStepProps {
  onSelect: (wantsReturn: boolean) => void;
  onBack: () => void;
}

export function ReturnStep({ onSelect, onBack }: ReturnStepProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <h1 className="font-display tracking-tight text-foreground mb-2" style={{ fontSize: 48, lineHeight: 1 }}>HAST DU EINEN RÜCKWEG?</h1>
      <p className="text-sm text-muted-foreground mb-10">Möchtest du auch deinen Rückweg überwachen?</p>

      <div className="space-y-3 mb-10">
        {/* Ja card */}
        <button
          onClick={() => setSelected(true)}
          className={cn(
            'w-full flex items-center gap-4 p-5 rounded-[20px] transition-all text-left',
          )}
          style={{
            backgroundColor: selected === true ? 'rgba(245,158,11,0.04)' : '#111111',
            border: selected === true ? '1px solid #F59E0B' : '1px solid #1F1F1F',
          }}
        >
          <div className={cn(
            'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0',
            selected === true ? 'bg-primary/20' : 'bg-secondary'
          )}>
            <ArrowLeftRight className={cn('h-6 w-6', selected === true ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Rückweg einrichten</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ich fahre täglich hin und zurück</p>
          </div>
        </button>

        {/* Nein card */}
        <button
          onClick={() => setSelected(false)}
          className={cn(
            'w-full flex items-center gap-4 p-5 rounded-[20px] transition-all text-left',
          )}
          style={{
            backgroundColor: selected === false ? 'rgba(245,158,11,0.04)' : '#111111',
            border: selected === false ? '1px solid #F59E0B' : '1px solid #1F1F1F',
          }}
        >
          <div className={cn(
            'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0',
            selected === false ? 'bg-primary/20' : 'bg-secondary'
          )}>
            <ArrowRight className={cn('h-6 w-6', selected === false ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Nur Hinweg</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ich richte den Rückweg später ein</p>
          </div>
        </button>
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => onSelect(selected)}
            className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all flex items-center justify-center gap-2"
          >
            Weiter
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
