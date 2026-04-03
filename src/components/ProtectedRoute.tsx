import { useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/pages/Paywall';

export default function ProtectedRoute() {
  const { user, loading, subscription, checkSubscription } = useAuth();
  const [searchParams] = useSearchParams();

  // Re-check subscription after successful checkout
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription();
    }
  }, [searchParams, checkSubscription]);

  if (loading || subscription.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (subscription.status === 'expired') {
    return <Paywall />;
  }

  return <Outlet />;
}
