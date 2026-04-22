import { useState, useEffect } from 'react';
import { RouteCard } from '@/components/RouteCard';
import { EmptyState } from '@/components/EmptyState';
import { fetchUserRoutes } from '@/lib/routes-service';
import type { CommuteRoute } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

export default function ManageRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRoutes()
      .then(setRoutes)
      .catch(err => console.error('Routen laden fehlgeschlagen:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-2xl text-foreground">MEINE ROUTEN</h1>
        </div>
        <button
          onClick={() => navigate('/route-setup')}
          className="h-10 px-4 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Neue Route
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="amber-spinner" />
        </div>
      ) : routes.length > 0 ? (
        <div className="space-y-3">
          {routes.map(route => (
            <RouteCard key={route.id} route={route} status={undefined} />
          ))}
        </div>
      ) : (
        <EmptyState icon="route" title="Noch keine Routen" description="Füge deine erste Pendelroute hinzu.">
          <button
            onClick={() => navigate('/route-setup')}
            className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-sm"
          >
            Route hinzufügen
          </button>
        </EmptyState>
      )}
    </div>
  );
}
