import { Outlet, Link, useLocation, useParams } from "react-router-dom"
import { Home, Users, Calendar, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "Domov",     path: "",           icon: Home },
  { label: "Deti",      path: "/deti",      icon: Users },
  { label: "Rozvrh",    path: "/rozvrh",    icon: Calendar },
  { label: "Notifikácie", path: "/notifikacie", icon: Bell },
]

export function ParentLayout() {
  const { slug } = useParams<{ slug: string }>()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Page content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
          {TABS.map(({ label, path, icon: Icon }) => {
            const href = `/${slug}/rodic${path}`
            const isActive = path === ""
              ? pathname === href
              : pathname.startsWith(href)

            return (
              <Link
                key={path}
                to={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
