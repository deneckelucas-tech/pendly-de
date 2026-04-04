import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { StationStep } from '@/components/wizard/StationStep';
import { JourneySelectStep } from '@/components/wizard/JourneySelectStep';
import { ReturnStep } from '@/components/wizard/ReturnStep';
import { SummaryStep } from '@/components/wizard/SummaryStep';
import { ManualJourneyBuilder } from '@/components/wizard/ManualJourneyBuilder';
import type { Station, Journey, Weekday } from '@/lib/types';

export default function RouteWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(0);
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [selectedJourneys, setSelectedJourneys] = useState<Journey[]>([]);
  const [hasReturn, setHasReturn] = useState<boolean | null>(null);
  const [returnJourneys, setReturnJourneys] = useState<Journey[]>([]);

  const handleCancel = () => navigate(-1);

  const goTo = (next: number) => {
    setPrevStep(step);
    setStep(next);
  };

  const isForward = step > prevStep;

  const getProgress = () => {
    if (step === 1) return 20;
    if (step === 2) return 40;
    if (step === 3 || step === 99) return 60;
    if (step === 4 || step === 98 || step === 97) return 80;
    if (step === 5) return 100;
    return 0;
  };

  const slideVariants = {
    enter: (forward: boolean) => ({
      opacity: 0,
      x: forward ? 80 : -80,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (forward: boolean) => ({
      opacity: 0,
      x: forward ? -80 : 80,
    }),
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Progress bar */}
      <div className="h-0.5 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${getProgress()}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="px-5 pt-6">
        <AnimatePresence mode="wait" custom={isForward}>
          {step === 1 && (
            <motion.div key="origin" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <StationStep
                title="WO STARTEST DU?"
                subtitle="Deine Abfahrtshaltestelle"
                onSelect={(s) => { setOrigin(s); goTo(2); }}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="dest" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <StationStep
                title="WO IST DEIN ZIEL?"
                subtitle="Deine Zielhaltestelle"
                onSelect={(s) => { setDestination(s); goTo(3); }}
                onBack={() => goTo(1)}
              />
            </motion.div>
          )}

          {step === 3 && origin && destination && (
            <motion.div key="journeys" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <JourneySelectStep
                origin={origin}
                destination={destination}
                transportTypes={[]}
                onNext={(journeys) => { setSelectedJourneys(journeys); goTo(4); }}
                onBack={() => goTo(2)}
                onManual={() => goTo(99)}
              />
            </motion.div>
          )}

          {step === 99 && origin && destination && (
            <motion.div key="manual" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ManualJourneyBuilder
                initialOrigin={origin}
                finalDestination={destination}
                onSave={(journey) => { setSelectedJourneys([journey]); goTo(4); }}
                onBack={() => goTo(3)}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="return" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ReturnStep
                onSelect={(wantsReturn) => {
                  setHasReturn(wantsReturn);
                  if (wantsReturn && origin && destination) {
                    goTo(98);
                  } else {
                    goTo(5);
                  }
                }}
                onBack={() => goTo(3)}
              />
            </motion.div>
          )}

          {step === 98 && origin && destination && (
            <motion.div key="return-journeys" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <JourneySelectStep
                origin={destination}
                destination={origin}
                transportTypes={[]}
                onNext={(journeys) => { setReturnJourneys(journeys); goTo(5); }}
                onBack={() => goTo(4)}
                onManual={() => goTo(97)}
              />
            </motion.div>
          )}

          {step === 97 && origin && destination && (
            <motion.div key="return-manual" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ManualJourneyBuilder
                initialOrigin={destination}
                finalDestination={origin}
                onSave={(journey) => { setReturnJourneys([journey]); goTo(5); }}
                onBack={() => goTo(98)}
              />
            </motion.div>
          )}

          {step === 5 && origin && destination && (
            <motion.div key="summary" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <SummaryStep
                origin={origin}
                destination={destination}
                journeys={selectedJourneys}
                returnJourneys={returnJourneys}
                hasReturn={hasReturn || false}
                onFinish={() => navigate('/dashboard')}
                onBack={() => goTo(4)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
