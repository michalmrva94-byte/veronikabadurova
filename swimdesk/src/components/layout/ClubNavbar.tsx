import { Link, useParams } from "react-router-dom"
import { Menu, X, Waves } from "lucide-react"
import { useState } from "react"
import { useClubContext } from "@/contexts/ClubContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "O klube", path: "" },
  { label: "Trénerský tím", path: "/treneri" },
  { label: "Skupiny", path: "/skupiny" },
  { label: "Rozvrh", path: "/rozvrh" },
  { label: "Výsledky", path: "/vysledky" },
  { label: "Novinky", path: "/novinky" },
  { label: "Kontakt", path: "/kontakt" },
]

export function ClubNavbar() {
  const { slug } = useParams<{ slug: string }>()
  const { club } = useClubContext()
  const [open, setOpen] = useState(false)

  const base = `/${slug}`

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={base} className="flex items-center gap-2 font-bold text-primary">
          {club?.logo_url ? (
            <img src={club.logo_url} alt={club.name} className="h-8 w-8 object-contain" />
          ) : (
            <Waves className="h-6 w-6" />
          )}
          <span className="text-lg">{club?.name ?? "SwimDesk"}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={`${base}${link.path}`}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button size="sm" asChild>
            <Link to={`${base}/prihlasenie`}>Prihlás sa</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden border-t bg-background", open ? "block" : "hidden")}>
        <nav className="container py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={`${base}${link.path}`}
              onClick={() => setOpen(false)}
              className="px-3 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Button className="w-full" asChild>
              <Link to={`${base}/prihlasenie`} onClick={() => setOpen(false)}>Prihlás sa</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
