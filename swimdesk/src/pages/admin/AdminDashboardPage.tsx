import { useClubContext } from "@/contexts/ClubContext"
import { useCoaches } from "@/hooks/useCoaches"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { useClubSwimmers } from "@/hooks/useSwimmers"
import { useSchedule } from "@/hooks/useSchedule"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Link, useParams } from "react-router-dom"
import { Users, Layers, Calendar, Trophy, CreditCard, ArrowRight, Waves } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"

function StatCard({ title, value, icon: Icon, href }: { title: string; value: string | number; icon: React.ElementType; href: string }) {
  const { slug } = useParams<{ slug: string }>()
  return (
    <Link to={`/${slug}/admin${href}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="py-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const { club } = useClubContext()
  const { data: coaches } = useCoaches(club?.id)
  const { data: groups } = useTrainingGroups(club?.id)
  const { data: swimmers } = useClubSwimmers(club?.id)
  const { data: schedule } = useSchedule(club?.id)

  const { data: lastImport } = useQuery({
    queryKey: ["last_paysy_import", club?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("paysy_import_batches")
        .select("imported_at, row_count, filename")
        .eq("club_id", club!.id)
        .order("imported_at", { ascending: false })
        .limit(1)
        .single()
      return data
    },
    enabled: !!club?.id,
  })

  if (!club) return (
    <div className="flex justify-center py-20">
      <Waves className="h-7 w-7 text-primary animate-pulse" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Admin — {club.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">Správa klubu a obsahu</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard title="Plavci" value={swimmers?.length ?? 0} icon={Users} href="/vysledky" />
        <StatCard title="Aktívni koučovia" value={coaches?.filter(c => c.is_active).length ?? 0} icon={Users} href="/treneri" />
        <StatCard title="Skupiny" value={groups?.filter(g => g.is_active).length ?? 0} icon={Layers} href="/skupiny" />
        <StatCard title="Tréningové sloty" value={schedule?.filter(s => s.is_active).length ?? 0} icon={Calendar} href="/rozvrh" />
      </div>

      {lastImport && (
        <Card>
          <CardContent className="py-4 flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Posledný Paysy import</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(lastImport.imported_at), "d. MMMM yyyy, HH:mm", { locale: sk })}
                {" · "}{lastImport.row_count} záznamov
                {lastImport.filename ? ` · ${lastImport.filename}` : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
