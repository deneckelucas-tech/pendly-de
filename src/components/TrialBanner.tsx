import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function TrialBanner() {
  const { subscription } = useAuth();

  if (subscription.status !== 'trialing') return null;

  const days = subscription.trialDaysRemaining;
  const isLastDay = days <= 1;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-sm',
        isLastDay
          ? 'bg-destructive/10 border border-destructive/20'
          : 'bg-primary/10 border border-primary/15'
      )}
    >
      {isLastDay ? (
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
      ) : (
        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
      )}
      <span className={cn(
        'text-xs font-medium',
        isLastDay ? 'text-destructive' : 'text-primary'
      )}>
        {isLastDay
          ? 'Deine Testphase endet heute'
          : `Deine Testphase endet in ${days} Tagen`}
      </span>
    </div>
  );
}
