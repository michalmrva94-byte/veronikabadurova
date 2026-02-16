import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ROUTES } from "@/lib/constants";

// Pages
import PublicLandingPage from "./pages/PublicLandingPage";
import ClientsLandingPage from "./pages/ClientsLandingPage";
import ReferralLandingPage from "./pages/ReferralLandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFound from "./pages/NotFound";
import CancellationPolicyPage from "./pages/CancellationPolicyPage";

// Client pages
import ClientDashboardPage from "./pages/client/DashboardPage";
import CalendarPage from "./pages/client/CalendarPage";
import MyTrainingsPage from "./pages/client/MyTrainingsPage";
import ProfilePage from "./pages/client/ProfilePage";
import FinancesPage from "./pages/client/FinancesPage";
import ReferralPage from "./pages/client/ReferralPage";
import NotificationsPage from "./pages/client/NotificationsPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminFinancesPage from "./pages/admin/AdminFinancesPage";
import AdminBroadcastPage from "./pages/admin/AdminBroadcastPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.HOME} element={<PublicLandingPage />} />
            <Route path={ROUTES.CLIENTS_LANDING} element={<ClientsLandingPage />} />
            <Route path={ROUTES.REFERRAL_LANDING} element={<ReferralLandingPage />} />
            <Route path={ROUTES.CANCELLATION_POLICY} element={<CancellationPolicyPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

            {/* Client routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={<ProtectedRoute><ClientDashboardPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.CALENDAR}
              element={<ProtectedRoute><CalendarPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.MY_TRAININGS}
              element={<ProtectedRoute><MyTrainingsPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.PROFILE}
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.FINANCES}
              element={<ProtectedRoute><FinancesPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.REFERRAL_PAGE}
              element={<ProtectedRoute><ReferralPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.NOTIFICATIONS}
              element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
            />

            {/* Admin routes */}
            <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />
            <Route
              path={ROUTES.ADMIN.DASHBOARD}
              element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.ADMIN.CALENDAR}
              element={<ProtectedRoute requireAdmin><AdminCalendarPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.ADMIN.CLIENTS}
              element={<ProtectedRoute requireAdmin><AdminClientsPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.ADMIN.FINANCES}
              element={<ProtectedRoute requireAdmin><AdminFinancesPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.ADMIN.BROADCAST}
              element={<ProtectedRoute requireAdmin><AdminBroadcastPage /></ProtectedRoute>}
            />
            <Route
              path={ROUTES.ADMIN.SETTINGS}
              element={<ProtectedRoute requireAdmin><AdminSettingsPage /></ProtectedRoute>}
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
