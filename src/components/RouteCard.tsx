import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { TRANSPORT_LABELS, WEEKDAY_LABELS, type CommuteRoute, type RouteStatusData } from '@/lib/types';
import { Star, BellOff, MapPin, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RouteCardProps {
  route: CommuteRoute;
  status?: RouteStatusData;
}

export function RouteCard({ route, status }: RouteCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md active:scale-[0.99]',
        route.is_paused && 'opacity-60'
      )}
      onClick={() => navigate(`/route/${route.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {route.is_favorite && <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />}
              <h3 className="font-semibold text-sm truncate">{route.name}</h3>
              {route.is_paused && <BellOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{route.origin}</span>
              <span>→</span>
              <span className="truncate">{route.destination}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{route.preferred_departure}</span>
              </div>
              <span className="text-border">|</span>
              <span>{TRANSPORT_LABELS[route.transport_type]}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {route.weekdays.map(day => (
                <span key={day} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm font-medium">
                  {WEEKDAY_LABELS[day]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {status && <StatusBadge status={status.status} delayMinutes={status.delay_minutes} />}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {status?.message && (
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{status.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
