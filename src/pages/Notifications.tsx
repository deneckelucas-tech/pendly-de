import { useState, useEffect } from 'react';
import { getMockRoutes, generateMockAlerts } from '@/lib/mock-data';
import type { Alert } from '@/lib/types';
import { Bell, Check, ArrowLeft, AlertTriangle, XCircle, ArrowRightLeft, RefreshCw, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';

const ALERT_ICONS: Record<string, React.ElementType> = {
  delay: Clock,
  cancellation: XCircle,
  disruption: AlertTriangle,
  platform_change: ArrowRightLeft,
  alternative_route: RefreshCw,
  daily_summary: FileText,
};

export default function Notifications() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setAlerts(generateMockAlerts(getMockRoutes()));
  }, []);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-2xl text-foreground">MELDUNGEN</h1>
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <Check className="h-3 w-3" /> Alle gelesen
          </button>
        )}
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map(alert => {
            const IconComp = ALERT_ICONS[alert.type] || Bell;
            return (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={cn(
                  'bg-card rounded-[20px] card-amber-border p-4 cursor-pointer transition-all',
                  !alert.is_read && 'border-primary/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <IconComp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn('text-sm', !alert.is_read ? 'font-semibold' : 'font-medium')}>{alert.title}</p>
                        <p className="text-[10px] text-primary/70 font-medium">{alert.route_name}</p>
                      </div>
                      {!alert.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(alert.created_at).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="train"
          title="Keine Meldungen"
          description="Wenn es Änderungen an deinen Routen gibt, wirst du hier benachrichtigt."
        />
      )}
    </div>
  );
}
