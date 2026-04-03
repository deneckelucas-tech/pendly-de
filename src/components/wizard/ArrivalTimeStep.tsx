import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ArrivalTimeStepProps {
  destinationName: string;
  onNext: (arrivalTime: string) => void;
  onBack: () => void;
}

export function ArrivalTimeStep({ destinationName, onNext, onBack }: ArrivalTimeStepProps) {
  const [time, setTime] = useState('08:00');

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
          <h1 className="text-xl font-bold text-foreground">Wann musst du da sein?</h1>
          <p className="text-sm text-muted-foreground">Ankunftszeit an {destinationName}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 -mt-16">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary" />
        </div>

        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="text-4xl font-bold text-center text-foreground bg-transparent outline-none appearance-none"
          style={{ width: '180px' }}
        />

        <p className="text-sm text-muted-foreground text-center max-w-[250px]">
          Wir suchen die besten Verbindungen, damit du pünktlich ankommst.
        </p>
      </div>

      <div className="mt-auto pb-4">
        <Button
          onClick={() => onNext(time)}
          className="w-full h-12 rounded-xl font-semibold text-sm"
        >
          Verbindungen suchen
        </Button>
      </div>
    </motion.div>
  );
}
