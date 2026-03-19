import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ClubLayout } from "@/components/layout/ClubLayout"
import { Waves } from "lucide-react"

// Lazy-loaded pages
const ClubLandingPage  = lazy(() => import("@/pages/ClubLandingPage"))
const CoachesPage      = lazy(() => import("@/pages/CoachesPage"))
const GroupsPage       = lazy(() => import("@/pages/GroupsPage"))
const SchedulePage     = lazy(() => import("@/pages/SchedulePage"))
const ResultsPage      = lazy(() => import("@/pages/ResultsPage"))
const NewsPage         = lazy(() => import("@/pages/NewsPage"))
const ContactPage      = lazy(() => import("@/pages/ContactPage"))
const ClubCMSPage      = lazy(() => import("@/pages/admin/ClubCMSPage"))

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Root redirect to pilot club */}
          <Route path="/" element={<Navigate to="/pezinok" replace />} />

          {/* Per-club routes */}
          <Route path="/:slug" element={<ClubLayout />}>
            <Route index element={<Suspense fallback={<PageLoader />}><ClubLandingPage /></Suspense>} />
            <Route path="treneri"  element={<Suspense fallback={<PageLoader />}><CoachesPage /></Suspense>} />
            <Route path="skupiny"  element={<Suspense fallback={<PageLoader />}><GroupsPage /></Suspense>} />
            <Route path="rozvrh"   element={<Suspense fallback={<PageLoader />}><SchedulePage /></Suspense>} />
            <Route path="vysledky" element={<Suspense fallback={<PageLoader />}><ResultsPage /></Suspense>} />
            <Route path="novinky"  element={<Suspense fallback={<PageLoader />}><NewsPage /></Suspense>} />
            <Route path="kontakt"  element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
            <Route path="admin"    element={<Suspense fallback={<PageLoader />}><ClubCMSPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
