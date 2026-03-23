import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SDAuthProvider } from "@/contexts/SDAuthContext";
import SDProtectedRoute from "@/components/auth/SDProtectedRoute";
import { SD_ROUTES } from "@/lib/sd-constants";

// SwimDesk Coach pages
import SDLoginPage from "@/pages/sd/LoginPage";
import SDRegisterPage from "@/pages/sd/RegisterPage";
import SDOnboardingPage from "@/pages/sd/OnboardingPage";
import SDDashboardPage from "@/pages/sd/DashboardPage";
import SDWorkoutsPage from "@/pages/sd/WorkoutsPage";
import SDGroupsPage from "@/pages/sd/GroupsPage";
import SDGroupDetailPage from "@/pages/sd/GroupDetailPage";
import SDSwimmersPage from "@/pages/sd/SwimmersPage";
import SDSwimmerDetailPage from "@/pages/sd/SwimmerDetailPage";
import SDLimitsPage from "@/pages/sd/LimitsPage";
import SDPlansPage from "@/pages/sd/AIPlansPage";
import SDSettingsPage from "@/pages/sd/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SDAuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path={SD_ROUTES.HOME} element={<Navigate to={SD_ROUTES.LOGIN} replace />} />
              <Route path={SD_ROUTES.LOGIN} element={<SDLoginPage />} />
              <Route path={SD_ROUTES.REGISTER} element={<SDRegisterPage />} />
              <Route path={SD_ROUTES.ONBOARDING} element={<SDOnboardingPage />} />

              {/* Protected routes */}
              <Route path={SD_ROUTES.DASHBOARD} element={<SDProtectedRoute><SDDashboardPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.WORKOUTS} element={<SDProtectedRoute><SDWorkoutsPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.GROUPS} element={<SDProtectedRoute><SDGroupsPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.GROUP_DETAIL} element={<SDProtectedRoute><SDGroupDetailPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.SWIMMERS} element={<SDProtectedRoute><SDSwimmersPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.SWIMMER_DETAIL} element={<SDProtectedRoute><SDSwimmerDetailPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.LIMITS} element={<SDProtectedRoute><SDLimitsPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.AI_PLANS} element={<SDProtectedRoute><SDPlansPage /></SDProtectedRoute>} />
              <Route path={SD_ROUTES.SETTINGS} element={<SDProtectedRoute><SDSettingsPage /></SDProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SDAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
