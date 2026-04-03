import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { StationStep } from '@/components/wizard/StationStep';
import { TransportStep } from '@/components/wizard/TransportStep';
import { ArrivalTimeStep } from '@/components/wizard/ArrivalTimeStep';
import { JourneySelectStep } from '@/components/wizard/JourneySelectStep';
import { ManualJourneyBuilder } from '@/components/wizard/ManualJourneyBuilder';
import { SaveStep } from '@/components/wizard/SaveStep';
import type { Station, TransportType, Journey } from '@/lib/types';

export default function RouteWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [arrivalTime, setArrivalTime] = useState<string>('08:00');
  const [selectedJourneys, setSelectedJourneys] = useState<Journey[]>([]);

  const handleCancel = () => navigate(-1);

  // Steps: 1=origin, 2=destination, 3=transport, 4=arrival time, 5=journey select, 5m=manual, 6=save
  const totalSteps = 6;

  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      <div className="mb-4">
        <WizardProgress currentStep={step === 99 ? 5 : step} totalSteps={totalSteps} />
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

        {step === 4 && destination && (
          <ArrivalTimeStep
            key="arrival"
            destinationName={destination.name.split(',')[0]}
            onNext={(time) => { setArrivalTime(time); setStep(5); }}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && origin && destination && (
          <JourneySelectStep
            key="journeys"
            origin={origin}
            destination={destination}
            transportTypes={transportTypes}
            arrivalTime={arrivalTime}
            onNext={(journeys) => { setSelectedJourneys(journeys); setStep(6); }}
            onBack={() => setStep(4)}
            onManual={() => setStep(99)}
          />
        )}

        {step === 99 && origin && destination && (
          <ManualJourneyBuilder
            key="manual"
            initialOrigin={origin}
            finalDestination={destination}
            onSave={(journey) => { setSelectedJourneys([journey]); setStep(6); }}
            onBack={() => setStep(5)}
          />
        )}

        {step === 6 && origin && destination && (
          <SaveStep
            key="save"
            origin={origin}
            destination={destination}
            transportTypes={transportTypes}
            journeys={selectedJourneys}
            onSave={() => navigate('/dashboard')}
            onBack={() => setStep(5)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
