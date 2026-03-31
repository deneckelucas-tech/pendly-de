import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMockRoutes, generateMockAlerts } from '@/lib/mock-data';
import type { Alert } from '@/lib/types';
import { Bell, BellOff, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';

const ALERT_ICONS: Record<string, string> = {
  delay: '⏱',
  cancellation: '❌',
  disruption: '⚠️',
  platform_change: '🔀',
  alternative_route: '🔄',
  daily_summary: '📋',
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
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Meldungen</h1>
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1">
            <Check className="h-3 w-3" /> Alle gelesen
          </Button>
        )}
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Card
              key={alert.id}
              className={cn('transition-all cursor-pointer', !alert.is_read && 'border-primary/30 bg-primary/[0.02]')}
              onClick={() => markRead(alert.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{ALERT_ICONS[alert.type] || '🔔'}</span>
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
              </CardContent>
            </Card>
          ))}
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
