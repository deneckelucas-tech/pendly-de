import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="flex gap-1.5 px-1">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            i < currentStep ? 'bg-primary' : 'bg-secondary'
          )}
        />
      ))}
    </div>
  );
}
