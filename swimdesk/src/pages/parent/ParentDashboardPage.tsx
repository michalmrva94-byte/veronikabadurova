import { Link, useParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useParentProfile } from "@/hooks/useParentProfile"
import { useSwimmers } from "@/hooks/useSwimmers"
import { NextTrainingCard } from "@/components/parent/NextTrainingCard"
import { SwimmerCard } from "@/components/parent/SwimmerCard"
import { Button } from "@/components/ui/button"
import { Waves, Plus, LogOut } from "lucide-react"
import { toast } from "sonner"

export default function ParentDashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, signOut } = useAuth()
  const { data: profile } = useParentProfile()
  const { data: swimmers, isLoading } = useSwimmers(profile?.id)

  const handleSignOut = async () => {
    await signOut()
    toast.success("Odhlásenie úspešné")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ahoj{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground p-2 rounded-md">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Next training cards */}
      {!isLoading && swimmers?.length ? (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ďalší tréning</h2>
          <div className="space-y-3">
            {swimmers.map((swimmer) => (
              <NextTrainingCard key={swimmer.id} groupId={swimmer.group_id} swimmerName={swimmer.full_name} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Swimmers summary */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Moje deti</h2>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/${slug}/rodic/deti`}>
              <Plus className="h-4 w-4 mr-1" />
              Pridať
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Waves className="h-6 w-6 text-primary animate-pulse" />
          </div>
        ) : swimmers?.length ? (
          <div className="space-y-2">
            {swimmers.map((swimmer) => (
              <SwimmerCard key={swimmer.id} swimmer={swimmer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Waves className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Zatiaľ žiadne deti.</p>
            <Button size="sm" className="mt-3" asChild>
              <Link to={`/${slug}/rodic/deti`}>Pridať dieťa</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
