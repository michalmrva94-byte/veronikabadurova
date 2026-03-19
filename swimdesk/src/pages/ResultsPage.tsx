import { useState } from "react"
import { useClubContext } from "@/contexts/ClubContext"
import { useResults } from "@/hooks/useResults"
import { GroupBadge } from "@/components/club/GroupBadge"
import { formatSwimTime, DISCIPLINE_DISPLAY } from "@/lib/utils"
import { Trophy, Star, Waves } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"
import type { SwimmerGroup } from "@/integrations/supabase/types"

export default function ResultsPage() {
  const { club } = useClubContext()
  const { data: results, isLoading } = useResults(club?.id)
  const [search, setSearch] = useState("")

  const filtered = results?.filter((r) =>
    r.swimmer_name.toLowerCase().includes(search.toLowerCase()) ||
    r.competition_name.toLowerCase().includes(search.toLowerCase())
  )

  // Group by competition
  const competitions = filtered?.reduce<Record<string, typeof filtered>>((acc, r) => {
    const key = `${r.competition_name}__${r.competition_date}`
    if (!acc[key]) acc[key] = []
    acc[key]!.push(r)
    return acc
  }, {})

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Výsledky pretekov</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Výsledky našich plavcov zo súťaží. Osobné rekordy sú označené hviezdičkou.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="search"
          placeholder="Hľadaj podľa plavca alebo pretekov…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Waves className="h-8 w-8 text-primary animate-pulse" />
        </div>
      )}

      {!isLoading && (!filtered || filtered.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Žiadne výsledky sa nenašli.</p>
        </div>
      )}

      {competitions && Object.entries(competitions).map(([key, compResults]) => {
        const first = compResults![0]!
        return (
          <div key={key} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4 border-b pb-3">
              <h2 className="text-xl font-bold">{first.competition_name}</h2>
              <span className="text-sm text-muted-foreground">
                {format(new Date(first.competition_date), "d. MMMM yyyy", { locale: sk })}
              </span>
              {first.location && (
                <span className="text-sm text-muted-foreground">· {first.location}</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2 pr-4 font-medium">Plavec</th>
                    <th className="pb-2 pr-4 font-medium">Skupina</th>
                    <th className="pb-2 pr-4 font-medium">Disciplína</th>
                    <th className="pb-2 pr-4 font-medium">Čas</th>
                    <th className="pb-2 font-medium">Miesto</th>
                  </tr>
                </thead>
                <tbody>
                  {compResults!.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 font-medium">
                        <span className="flex items-center gap-1.5">
                          {r.is_personal_record && (
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                          {r.swimmer_name}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {r.training_groups ? (
                          <GroupBadge group={r.training_groups.slug as SwimmerGroup} />
                        ) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {DISCIPLINE_DISPLAY[r.discipline] ?? r.discipline} {r.distance_m}m
                      </td>
                      <td className="py-3 pr-4 font-mono font-semibold">
                        {formatSwimTime(r.result_time_ms)}
                      </td>
                      <td className="py-3">
                        {r.place ? (
                          <span className={`font-bold ${r.place <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                            {r.place}.
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
