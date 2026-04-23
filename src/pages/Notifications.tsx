import { ArrowLeft, Bell, AlertTriangle, AlertCircle, Info, Clock, Construction, XCircle, CheckCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

function getIcon(n: AppNotification) {
  if (n.kind === 'cancellation') return XCircle;
  if (n.kind === 'delay') return Clock;
  if (n.kind === 'replacement') return Construction;
  if (n.kind === 'disruption') return AlertTriangle;
  if (n.severity === 'warning') return AlertCircle;
  return Info;
}

function getSeverityClasses(sev: AppNotification['severity']) {
  if (sev === 'critical') return 'bg-destructive/15 text-destructive';
  if (sev === 'warning') return 'bg-primary/15 text-primary';
  return 'bg-muted/40 text-muted-foreground';
}

function formatTime(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} Std.`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, loading, isRead, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  // Mark all as read when leaving the page
  useEffect(() => {
    return () => {
      if (unreadCount > 0) markAllAsRead();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-2xl text-foreground">MELDUNGEN</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Alle gelesen
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="card-amber-border bg-card rounded-[16px] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-muted/40 rounded mb-2" />
              <div className="h-3 w-full bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <>
          <EmptyState
            icon="train"
            title="Keine Meldungen"
            description="Wenn es Änderungen an deinen Routen gibt, wirst du hier benachrichtigt."
          />
          <div className="mt-6 card-amber-border bg-card rounded-[16px] p-4 flex items-start gap-3">
            <Bell className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Push- und E-Mail-Benachrichtigungen werden automatisch gesendet, sobald sich der Status einer deiner Routen ändert.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = getIcon(n);
            const read = isRead(n.id);
            return (
              <button
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.routeId) navigate(`/routes/${n.routeId}`);
                }}
                className={cn(
                  'w-full text-left card-amber-border bg-card rounded-[16px] p-4 flex items-start gap-3 hover:bg-secondary/30 transition-colors',
                  !read && 'ring-1 ring-primary/30'
                )}
              >
                <div className={cn('h-9 w-9 shrink-0 rounded-full flex items-center justify-center', getSeverityClasses(n.severity))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={cn('text-sm leading-tight', read ? 'text-muted-foreground' : 'text-foreground font-semibold')}>
                      {n.title}
                    </p>
                    {!read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{n.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {n.routeName && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded font-medium text-foreground">
                        {n.routeName}
                      </span>
                    )}
                    {n.lineName && !n.routeName && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded font-medium text-foreground">
                        {n.lineName}
                      </span>
                    )}
                    <span>{formatTime(n.timestamp)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
