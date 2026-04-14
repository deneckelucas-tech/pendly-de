import { useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const isDev = import.meta.env.DEV;

export default function ProtectedRoute() {
  const { user, loading, checkSubscription, subscription } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription();
    }
  }, [searchParams, checkSubscription]);

  // Dev mode: skip auth entirely
  if (isDev) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="amber-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  // Redirect expired users to paywall
  if (!subscription.subscribed && subscription.status !== 'loading') {
    return <Navigate to="/paywall" replace />;
  }

  return <Outlet />;
}
