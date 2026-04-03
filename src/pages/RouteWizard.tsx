import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { StationStep } from '@/components/wizard/StationStep';
import { JourneySelectStep } from '@/components/wizard/JourneySelectStep';
import { ReturnStep } from '@/components/wizard/ReturnStep';
import { SummaryStep } from '@/components/wizard/SummaryStep';
import { ManualJourneyBuilder } from '@/components/wizard/ManualJourneyBuilder';
import type { Station, Journey } from '@/lib/types';

export default function RouteWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [selectedJourneys, setSelectedJourneys] = useState<Journey[]>([]);
  const [hasReturn, setHasReturn] = useState<boolean | null>(null);
  const [returnJourneys, setReturnJourneys] = useState<Journey[]>([]);

  const handleCancel = () => navigate(-1);

  // Steps: 1=origin, 2=destination, 3=journey select, 4=return?, 5=summary
  // 99=manual builder, 98=return journey select, 97=return manual
  const getProgress = () => {
    if (step === 1) return 20;
    if (step === 2) return 40;
    if (step === 3 || step === 99) return 60;
    if (step === 4 || step === 98 || step === 97) return 80;
    if (step === 5) return 100;
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Thin amber progress bar */}
      <div className="h-0.5 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${getProgress()}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="px-5 pt-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StationStep
              key="origin"
              title="WO STARTEST DU?"
              subtitle="Deine Abfahrtshaltestelle"
              onSelect={(s) => { setOrigin(s); setStep(2); }}
              onCancel={handleCancel}
            />
          )}

          {step === 2 && (
            <StationStep
              key="dest"
              title="WO IST DEIN ZIEL?"
              subtitle="Deine Zielhaltestelle"
              onSelect={(s) => { setDestination(s); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && origin && destination && (
            <JourneySelectStep
              key="journeys"
              origin={origin}
              destination={destination}
              transportTypes={[]}
              onNext={(journeys) => { setSelectedJourneys(journeys); setStep(4); }}
              onBack={() => setStep(2)}
              onManual={() => setStep(99)}
            />
          )}

          {step === 99 && origin && destination && (
            <ManualJourneyBuilder
              key="manual"
              initialOrigin={origin}
              finalDestination={destination}
              onSave={(journey) => { setSelectedJourneys([journey]); setStep(4); }}
              onBack={() => setStep(3)}
            />
          )}

          {step === 4 && (
            <ReturnStep
              key="return"
              onSelect={(wantsReturn) => {
                setHasReturn(wantsReturn);
                if (wantsReturn && origin && destination) {
                  setStep(98);
                } else {
                  setStep(5);
                }
              }}
              onBack={() => setStep(3)}
            />
          )}

          {step === 98 && origin && destination && (
            <JourneySelectStep
              key="return-journeys"
              origin={destination}
              destination={origin}
              transportTypes={[]}
              onNext={(journeys) => { setReturnJourneys(journeys); setStep(5); }}
              onBack={() => setStep(4)}
              onManual={() => setStep(97)}
            />
          )}

          {step === 97 && origin && destination && (
            <ManualJourneyBuilder
              key="return-manual"
              initialOrigin={destination}
              finalDestination={origin}
              onSave={(journey) => { setReturnJourneys([journey]); setStep(5); }}
              onBack={() => setStep(98)}
            />
          )}

          {step === 5 && origin && destination && (
            <SummaryStep
              key="summary"
              origin={origin}
              destination={destination}
              journeys={selectedJourneys}
              returnJourneys={returnJourneys}
              hasReturn={hasReturn || false}
              onFinish={() => navigate('/dashboard')}
              onBack={() => setStep(4)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
