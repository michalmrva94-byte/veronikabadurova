import { useState } from "react"
import { Outlet, Link, useLocation, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useClubContext } from "@/contexts/ClubContext"
import { RoleGate } from "./RoleGate"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, Layers, Calendar, Newspaper,
  Settings, Trophy, CreditCard, ChevronLeft, Menu, X, LogOut, Waves
} from "lucide-react"

const NAV_ITEMS = [
  { label: "Prehľad",    path: "",           icon: LayoutDashboard, minRole: "editor" as const },
  { label: "Novinky",    path: "/novinky",   icon: Newspaper,       minRole: "editor" as const },
  { label: "Trénerský tím", path: "/treneri",icon: Users,           minRole: "admin" as const },
  { label: "Skupiny",    path: "/skupiny",   icon: Layers,          minRole: "admin" as const },
  { label: "Rozvrh",     path: "/rozvrh",    icon: Calendar,        minRole: "admin" as const },
  { label: "Výsledky",   path: "/vysledky",  icon: Trophy,          minRole: "admin" as const },
  { label: "Paysy",      path: "/paysy",     icon: CreditCard,      minRole: "admin" as const },
  { label: "Nastavenia", path: "/nastavenia",icon: Settings,        minRole: "editor" as const },
]

export function AdminLayout() {
  const { slug } = useParams<{ slug: string }>()
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const { club } = useClubContext()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const base = `/${slug}/admin`

  const handleSignOut = async () => {
    await signOut()
    navigate(`/${slug}/prihlasenie`)
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b">
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">{club?.name ?? "SwimDesk"} Admin</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon, minRole }) => {
          const href = `${base}${path}`
          const isActive = path === ""
            ? pathname === href
            : pathname.startsWith(href)

          return (
            <RoleGate key={path} minRole={minRole}>
              <Link
                to={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </RoleGate>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-1">
        <Link
          to={`/${slug}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Webstránka klubu
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Odhlásiť sa
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r bg-background shrink-0">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-background border-r">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">{club?.name ?? "SwimDesk"} Admin</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
