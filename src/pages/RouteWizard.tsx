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
  const [commuteDays, setCommuteDays] = useState<Weekday[]>(['mon', 'tue', 'wed', 'thu', 'fri']);

  const handleCancel = () => navigate(-1);

  const goTo = (next: number) => {
    setPrevStep(step);
    setStep(next);
  };

  const getProgress = () => {
    if (step === 1) return 25;
    if (step === 2 || step === 99) return 50;
    if (step === 3 || step === 98 || step === 97) return 75;
    if (step === 4) return 100;
    return 0;
  };

  const isForward = step > prevStep;

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

  const stepLabels = [
    { num: 1, label: 'Strecke' },
    { num: 2, label: 'Züge' },
    { num: 3, label: 'Rückweg' },
    { num: 4, label: 'Fertig' },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Progress header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-1.5">
          {stepLabels.map((s, i) => {
            const currentNum = step >= 98 ? 3 : step >= 99 ? 2 : step;
            const isActive = s.num <= currentNum;
            const isCurrent = s.num === currentNum;
            return (
              <div key={s.num} className="flex-1">
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  }}
                />
                <p className={`text-[9px] mt-1 font-medium tracking-wide uppercase ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait" custom={isForward}>
          {step === 1 && (
            <motion.div key="stations" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <StationStep
                onStationsSelected={(o, d) => {
                  setOrigin(o);
                  setDestination(d);
                  goTo(2);
                }}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {step === 2 && origin && destination && (
            <motion.div key="journeys" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <JourneySelectStep
                origin={origin}
                destination={destination}
                transportTypes={[]}
                onNext={(journeys, days) => { setSelectedJourneys(journeys); setCommuteDays(days); goTo(3); }}
                onBack={() => goTo(1)}
                onManual={() => goTo(99)}
              />
            </motion.div>
          )}

          {step === 99 && origin && destination && (
            <motion.div key="manual" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ManualJourneyBuilder
                initialOrigin={origin}
                finalDestination={destination}
                initialDays={commuteDays}
                onSave={(journeys, days) => { setSelectedJourneys(journeys); setCommuteDays(days); goTo(3); }}
                onBack={() => goTo(2)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="return" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ReturnStep
                onSelect={(wantsReturn) => {
                  setHasReturn(wantsReturn);
                  if (wantsReturn && origin && destination) {
                    goTo(98);
                  } else {
                    goTo(4);
                  }
                }}
                onBack={() => goTo(2)}
              />
            </motion.div>
          )}

          {step === 98 && origin && destination && (
            <motion.div key="return-journeys" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <JourneySelectStep
                origin={destination}
                destination={origin}
                transportTypes={[]}
                onNext={(journeys) => { setReturnJourneys(journeys); goTo(4); }}
                onBack={() => goTo(3)}
                onManual={() => goTo(97)}
              />
            </motion.div>
          )}

          {step === 97 && origin && destination && (
            <motion.div key="return-manual" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ManualJourneyBuilder
                initialOrigin={destination}
                finalDestination={origin}
                initialDays={commuteDays}
                onSave={(journeys) => { setReturnJourneys(journeys); goTo(4); }}
                onBack={() => goTo(98)}
              />
            </motion.div>
          )}

          {step === 4 && origin && destination && (
            <motion.div key="summary" custom={isForward} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeOut' }}>
              <SummaryStep
                origin={origin}
                destination={destination}
                journeys={selectedJourneys}
                returnJourneys={returnJourneys}
                hasReturn={hasReturn || false}
                weekdays={commuteDays}
                onFinish={() => navigate('/dashboard')}
                onBack={() => goTo(3)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
