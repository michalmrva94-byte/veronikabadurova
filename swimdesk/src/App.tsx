import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { ClubLayout } from "@/components/layout/ClubLayout"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedParentRoute } from "@/components/auth/ProtectedParentRoute"
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute"
import { Waves } from "lucide-react"

// --- Public pages ---
const ClubLandingPage  = lazy(() => import("@/pages/ClubLandingPage"))
const CoachesPage      = lazy(() => import("@/pages/CoachesPage"))
const GroupsPage       = lazy(() => import("@/pages/GroupsPage"))
const SchedulePage     = lazy(() => import("@/pages/SchedulePage"))
const ResultsPage      = lazy(() => import("@/pages/ResultsPage"))
const NewsPage         = lazy(() => import("@/pages/NewsPage"))
const ContactPage      = lazy(() => import("@/pages/ContactPage"))

// --- Auth pages ---
const LoginPage        = lazy(() => import("@/pages/parent/LoginPage"))
const RegisterPage     = lazy(() => import("@/pages/parent/RegisterPage"))
const ForgotPasswordPage = lazy(() => import("@/pages/parent/ForgotPasswordPage"))
const ResetPasswordPage  = lazy(() => import("@/pages/parent/ResetPasswordPage"))

// --- Parent app ---
const ParentDashboardPage  = lazy(() => import("@/pages/parent/ParentDashboardPage"))
const ChildrenPage         = lazy(() => import("@/pages/parent/ChildrenPage"))
const ScheduleViewPage     = lazy(() => import("@/pages/parent/ScheduleViewPage"))
const NotificationsPage    = lazy(() => import("@/pages/parent/NotificationsPage"))

// --- Admin pages ---
const AdminDashboardPage   = lazy(() => import("@/pages/admin/AdminDashboardPage"))
const CoachesAdminPage     = lazy(() => import("@/pages/admin/CoachesAdminPage"))
const GroupsAdminPage      = lazy(() => import("@/pages/admin/GroupsAdminPage"))
const ScheduleAdminPage    = lazy(() => import("@/pages/admin/ScheduleAdminPage"))
const NewsAdminPage        = lazy(() => import("@/pages/admin/NewsAdminPage"))
const NewsArticleEditorPage = lazy(() => import("@/pages/admin/NewsArticleEditorPage"))
const ClubSettingsPage     = lazy(() => import("@/pages/admin/ClubSettingsPage"))
const ResultsImportPage    = lazy(() => import("@/pages/admin/ResultsImportPage"))
const PaysyPage            = lazy(() => import("@/pages/admin/PaysyPage"))

// Lazy parent layout (since it's a route element too)
import { ParentLayout }  from "@/components/parent/ParentLayout"
import { AdminLayout }   from "@/components/admin/AdminLayout"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Waves className="h-7 w-7 text-primary animate-pulse" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root redirect to pilot club */}
            <Route path="/" element={<Navigate to="/pezinok" replace />} />

            {/* Per-club routes */}
            <Route path="/:slug" element={<ClubLayout />}>
              {/* Public */}
              <Route index element={<S><ClubLandingPage /></S>} />
              <Route path="treneri"  element={<S><CoachesPage /></S>} />
              <Route path="skupiny"  element={<S><GroupsPage /></S>} />
              <Route path="rozvrh"   element={<S><SchedulePage /></S>} />
              <Route path="vysledky" element={<S><ResultsPage /></S>} />
              <Route path="novinky"  element={<S><NewsPage /></S>} />
              <Route path="kontakt"  element={<S><ContactPage /></S>} />

              {/* Auth */}
              <Route path="prihlasenie"    element={<S><LoginPage /></S>} />
              <Route path="registracia"    element={<S><RegisterPage /></S>} />
              <Route path="zabudnute-heslo" element={<S><ForgotPasswordPage /></S>} />
              <Route path="reset-hesla"    element={<S><ResetPasswordPage /></S>} />

              {/* Parent app */}
              <Route
                path="rodic"
                element={
                  <ProtectedParentRoute>
                    <ParentLayout />
                  </ProtectedParentRoute>
                }
              >
                <Route index element={<S><ParentDashboardPage /></S>} />
                <Route path="deti"        element={<S><ChildrenPage /></S>} />
                <Route path="rozvrh"      element={<S><ScheduleViewPage /></S>} />
                <Route path="notifikacie" element={<S><NotificationsPage /></S>} />
              </Route>

              {/* Admin */}
              <Route
                path="admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<S><AdminDashboardPage /></S>} />
                <Route path="treneri"    element={<S><CoachesAdminPage /></S>} />
                <Route path="skupiny"    element={<S><GroupsAdminPage /></S>} />
                <Route path="rozvrh"     element={<S><ScheduleAdminPage /></S>} />
                <Route path="novinky"    element={<S><NewsAdminPage /></S>} />
                <Route path="novinky/nova" element={<S><NewsArticleEditorPage /></S>} />
                <Route path="novinky/:id"  element={<S><NewsArticleEditorPage /></S>} />
                <Route path="nastavenia"   element={<S><ClubSettingsPage /></S>} />
                <Route path="vysledky"     element={<S><ResultsImportPage /></S>} />
                <Route path="paysy"        element={<S><PaysyPage /></S>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
