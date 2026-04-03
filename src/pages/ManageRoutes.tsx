import { useState, useEffect } from 'react';
import { RouteCard } from '@/components/RouteCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { getMockRoutes, generateMockStatus } from '@/lib/mock-data';
import type { CommuteRoute, RouteStatusData } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

export default function ManageRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RouteStatusData>>({});

  useEffect(() => {
    const mockRoutes = getMockRoutes();
    setRoutes(mockRoutes);
    const s: Record<string, RouteStatusData> = {};
    mockRoutes.forEach(r => { s[r.id] = generateMockStatus(r.id); });
    setStatuses(s);
  }, []);

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Meine Routen</h1>
        </div>
        <Button size="sm" onClick={() => navigate('/onboarding')} className="gap-1 font-semibold rounded-xl">
          <Plus className="h-4 w-4" /> Neue Route
        </Button>
      </div>

      {routes.length > 0 ? (
        <div className="space-y-3">
          {routes.map(route => (
            <RouteCard key={route.id} route={route} status={statuses[route.id]} />
          ))}
        </div>
      ) : (
        <EmptyState icon="route" title="Noch keine Routen" description="Füge deine erste Pendelroute hinzu.">
          <Button onClick={() => navigate('/onboarding')} className="font-semibold rounded-xl">
            Route hinzufügen
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
