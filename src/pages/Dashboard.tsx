import { useState, useEffect, useCallback } from 'react';
import { RouteCard } from '@/components/RouteCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { getMockRoutes, generateMockAlerts, generateMockStatus } from '@/lib/mock-data';
import type { CommuteRoute, RouteStatusData, Alert } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RouteStatusData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const loadData = useCallback(() => {
    const mockRoutes = getMockRoutes();
    setRoutes(mockRoutes);
    const newStatuses: Record<string, RouteStatusData> = {};
    mockRoutes.forEach(r => { newStatuses[r.id] = generateMockStatus(r.id); });
    setStatuses(newStatuses);
    setAlerts(generateMockAlerts(mockRoutes));
    setLastChecked(new Date());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    loadData();
    setRefreshing(false);
  };

  // Determine today's routes based on connections' weekdays
  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[new Date().getDay()];
  const todayRoutes = routes.filter(r =>
    r.connections.some(c => c.weekdays.includes(todayKey))
  );
  const otherRoutes = routes.filter(r => !todayRoutes.includes(r));
  const unreadAlerts = alerts.filter(a => !a.is_read);

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Guten Morgen 👋</h1>
          <p className="text-xs text-muted-foreground">
            Zuletzt aktualisiert: {lastChecked.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="icon" onClick={() => navigate('/onboarding')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {unreadAlerts.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Wichtige Meldungen heute
          </h2>
          <div className="space-y-2">
            {unreadAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="bg-card border rounded-xl p-3 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate('/notifications')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(alert.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3">Heutige Routen</h2>
        {todayRoutes.length > 0 ? (
          <div className="space-y-3">
            {todayRoutes.map((route, i) => (
              <motion.div key={route.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <RouteCard route={route} status={statuses[route.id]} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState icon="route" title="Keine Routen für heute" description="Füge eine Route hinzu oder ändere die aktiven Tage.">
            <Button onClick={() => navigate('/onboarding')} className="font-semibold">Route hinzufügen</Button>
          </EmptyState>
        )}
      </section>

      {otherRoutes.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Weitere Routen</h2>
          <div className="space-y-3">
            {otherRoutes.map(route => (
              <RouteCard key={route.id} route={route} status={statuses[route.id]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
