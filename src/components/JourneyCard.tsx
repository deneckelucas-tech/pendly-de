import { formatTime } from '@/lib/transport-api';
import type { Journey, JourneyLeg } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, ArrowRight, Clock } from 'lucide-react';

interface JourneyCardProps {
  journey: Journey;
  selected: boolean;
  onToggle: () => void;
}

export function JourneyCard({ journey, selected, onToggle }: JourneyCardProps) {
  const legs = journey.legs;
  if (legs.length === 0) return null;

  const totalDep = formatTime(legs[0].departure);
  const totalArr = formatTime(legs[legs.length - 1].arrival);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full text-left border rounded-xl p-3 transition-all',
        selected
          ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30'
          : 'border-border hover:border-primary/30 hover:bg-accent/50'
      )}
    >
      {/* Summary line */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">{totalDep}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-semibold">{totalArr}</span>
          {legs.length > 1 && (
            <span className="text-[10px] text-muted-foreground">({legs.length}x Umstieg)</span>
          )}
        </div>
        <div className={cn(
          'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
          selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
        )}>
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>

      {/* Legs */}
      <div className="space-y-1.5">
        {legs.map((leg, i) => (
          <LegRow key={i} leg={leg} isLast={i === legs.length - 1} />
        ))}
      </div>
    </button>
  );
}

function LegRow({ leg, isLast }: { leg: JourneyLeg; isLast: boolean }) {
  const depTime = formatTime(leg.departure);
  const arrTime = formatTime(leg.arrival);
  const delay = leg.departureDelay ? Math.round(leg.departureDelay / 60) : 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-medium w-11 shrink-0">{depTime}</span>
      {delay > 0 && (
        <span className="text-[10px] text-status-minor-delay font-semibold">+{delay}</span>
      )}
      <span className={cn(
        'px-1.5 py-0.5 rounded font-semibold text-[10px] shrink-0',
        leg.cancelled
          ? 'bg-status-cancelled text-status-cancelled-foreground line-through'
          : 'bg-secondary text-secondary-foreground'
      )}>
        {leg.line?.name || leg.line?.productName || '?'}
      </span>
      <span className="text-muted-foreground truncate">
        {leg.origin.name} → {leg.destination.name}
      </span>
      {leg.departurePlatform && (
        <span className="text-[10px] text-muted-foreground shrink-0">Gl. {leg.departurePlatform}</span>
      )}
    </div>
  );
}
