import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { StationStep } from '@/components/wizard/StationStep';
import { TransportStep } from '@/components/wizard/TransportStep';
import { JourneySelectStep } from '@/components/wizard/JourneySelectStep';
import { SaveStep } from '@/components/wizard/SaveStep';
import type { Station, TransportType, Journey } from '@/lib/types';

export default function RouteWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [selectedJourneys, setSelectedJourneys] = useState<Journey[]>([]);

  const handleCancel = () => navigate(-1);

  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      {/* Progress bar */}
      <div className="mb-4">
        <WizardProgress currentStep={step} totalSteps={5} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StationStep
            key="origin"
            title="Wo startest du?"
            subtitle="Gib deine Abfahrtshaltestelle ein"
            onSelect={(s) => { setOrigin(s); setStep(2); }}
            onCancel={handleCancel}
          />
        )}

        {step === 2 && (
          <StationStep
            key="dest"
            title="Wo ist dein Ziel?"
            subtitle="Gib deine Zielhaltestelle ein"
            onSelect={(s) => { setDestination(s); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <TransportStep
            key="transport"
            initialSelected={transportTypes}
            onNext={(types) => { setTransportTypes(types); setStep(4); }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && origin && destination && (
          <JourneySelectStep
            key="journeys"
            origin={origin}
            destination={destination}
            transportTypes={transportTypes}
            onNext={(journeys) => { setSelectedJourneys(journeys); setStep(5); }}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && origin && destination && (
          <SaveStep
            key="save"
            origin={origin}
            destination={destination}
            transportTypes={transportTypes}
            journeys={selectedJourneys}
            onSave={() => navigate('/dashboard')}
            onBack={() => setStep(4)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
