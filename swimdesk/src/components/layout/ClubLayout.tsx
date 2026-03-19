import { Outlet } from "react-router-dom"
import { ClubNavbar } from "./ClubNavbar"
import { ClubProvider } from "@/contexts/ClubContext"
import { useClubContext } from "@/contexts/ClubContext"
import { Waves } from "lucide-react"

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <Waves className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Klub nenájdený</h1>
      <p className="text-muted-foreground">Tento plavecký klub neexistuje alebo nie je aktívny.</p>
    </div>
  )
}

function ClubLayoutInner() {
  const { club, isLoading } = useClubContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Waves className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Načítavam klub…</p>
        </div>
      </div>
    )
  }

  if (!club) return <NotFound />

  return (
    <div className="flex flex-col min-h-screen">
      <ClubNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-8 bg-muted/40">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {club.name} · Powered by SwimDesk</p>
          {club.city && <p className="mt-1">{club.city}, {club.country}</p>}
        </div>
      </footer>
    </div>
  )
}

export function ClubLayout() {
  return (
    <ClubProvider>
      <ClubLayoutInner />
    </ClubProvider>
  )
}
