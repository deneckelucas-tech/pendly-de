import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG, type RouteStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RouteStatus;
  delayMinutes?: number;
  className?: string;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, delayMinutes, className, size = 'default' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const label = delayMinutes && (status === 'minor_delay' || status === 'major_delay')
    ? `+${delayMinutes} Min.`
    : config.label;

  return (
    <Badge
      className={cn(
        config.colorClass,
        'border-0 font-semibold',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2.5 py-0.5',
        status === 'cancelled' && 'animate-pulse-subtle',
        className
      )}
    >
      {label}
    </Badge>
  );
}
