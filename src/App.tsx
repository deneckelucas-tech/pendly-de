import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import RouteWizard from "./pages/RouteWizard";
import Dashboard from "./pages/Dashboard";
import RouteDetail from "./pages/RouteDetail";
import ManageRoutes from "./pages/ManageRoutes";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/route-setup" element={<RouteWizard />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/route/:id" element={<RouteDetail />} />
                <Route path="/routes" element={<ManageRoutes />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
