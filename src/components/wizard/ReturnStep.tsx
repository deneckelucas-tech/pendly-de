import { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, ArrowRight, Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ReturnStepProps {
  onSelect: (wantsReturn: boolean) => void;
  onBack: () => void;
}

export function ReturnStep({ onSelect, onBack }: ReturnStepProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Visual header */}
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ArrowLeftRight className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h1 className="font-display tracking-tight text-foreground text-center mb-2" style={{ fontSize: 32, lineHeight: 1.1 }}>
        Auch zurück?
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Möchtest du deinen Rückweg ebenfalls überwachen?
      </p>

      <div className="space-y-3 mb-auto">
        {/* Ja card */}
        <button
          onClick={() => setSelected(true)}
          className={cn(
            'w-full flex items-center gap-4 p-5 rounded-[20px] transition-all text-left border',
            selected === true
              ? 'bg-primary/5 border-primary shadow-md'
              : 'bg-card border-border shadow-sm hover:border-primary/30'
          )}
          style={selected === true ? { boxShadow: '0 4px 24px rgba(30,78,216,0.12)' } : {}}
        >
          <div className={cn(
            'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors',
            selected === true ? 'bg-primary/20' : 'bg-secondary'
          )}>
            <ArrowLeftRight className={cn('h-6 w-6', selected === true ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Hin & Rückweg</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ich fahre täglich hin und zurück</p>
          </div>
        </button>

        {/* Nein card */}
        <button
          onClick={() => setSelected(false)}
          className={cn(
            'w-full flex items-center gap-4 p-5 rounded-[20px] transition-all text-left border',
            selected === false
              ? 'bg-primary/5 border-primary shadow-md'
              : 'bg-card border-border shadow-sm hover:border-primary/30'
          )}
          style={selected === false ? { boxShadow: '0 4px 24px rgba(30,78,216,0.12)' } : {}}
        >
          <div className={cn(
            'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors',
            selected === false ? 'bg-primary/20' : 'bg-secondary'
          )}>
            <ArrowRight className={cn('h-6 w-6', selected === false ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Nur Hinweg</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rückweg kann ich später einrichten</p>
          </div>
        </button>
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
          <button
            onClick={() => onSelect(selected)}
            className="w-full h-14 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all flex items-center justify-center gap-2 shadow-md"
            style={{ boxShadow: '0 8px 32px rgba(30,78,216,0.20)' }}
          >
            Weiter
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
