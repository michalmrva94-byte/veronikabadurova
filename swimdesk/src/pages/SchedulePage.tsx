import { useClubContext } from "@/contexts/ClubContext"
import { useSchedule } from "@/hooks/useSchedule"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { GroupBadge } from "@/components/club/GroupBadge"
import { DAY_NAMES, DAY_ORDER } from "@/lib/utils"
import { Waves } from "lucide-react"
import { useState } from "react"
import type { SwimmerGroup } from "@/integrations/supabase/types"

export default function SchedulePage() {
  const { club } = useClubContext()
  const { data: schedule, isLoading } = useSchedule(club?.id)
  const { data: groups } = useTrainingGroups(club?.id)
  const [activeGroup, setActiveGroup] = useState<string>("all")

  const filtered = schedule?.filter(
    (e) => activeGroup === "all" || e.group_id === activeGroup
  )

  const byDay = DAY_ORDER.reduce<Record<string, typeof filtered>>((acc, day) => {
    acc[day] = filtered?.filter((e) => e.day_of_week === day)
    return acc
  }, {})

  const activeDays = DAY_ORDER.filter((d) => (byDay[d]?.length ?? 0) > 0)

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Rozvrh tréningov</h1>
        <p className="text-muted-foreground text-lg">Aktuálny tréningový plán pre všetky skupiny.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Waves className="h-8 w-8 text-primary animate-pulse" />
        </div>
      )}

      {/* Group filter */}
      {groups && groups.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveGroup("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeGroup === "all" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
          >
            Všetky skupiny
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeGroup === g.id ? "text-white" : "bg-muted hover:bg-muted/80"}`}
              style={activeGroup === g.id ? { backgroundColor: g.color ?? "#0EA5E9" } : {}}
            >
              {g.icon_emoji} {g.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Schedule table per day */}
      {activeDays.length === 0 && !isLoading && (
        <div className="text-center py-20 text-muted-foreground">
          <Waves className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Rozvrh bude čoskoro zverejnený.</p>
        </div>
      )}

      <div className="space-y-8">
        {activeDays.map((day) => (
          <div key={day}>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">{DAY_NAMES[day]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {byDay[day]?.map((entry) => (
                <div key={entry.id} className="flex gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0 text-center">
                    <p className="text-lg font-bold text-primary">{entry.start_time.slice(0, 5)}</p>
                    <p className="text-xs text-muted-foreground">{entry.end_time.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    {entry.training_groups && (
                      <GroupBadge
                        group={entry.training_groups.slug as SwimmerGroup}
                        emoji={entry.training_groups.icon_emoji}
                        className="mb-1.5"
                      />
                    )}
                    {entry.location && (
                      <p className="text-sm text-muted-foreground truncate">{entry.location}</p>
                    )}
                    {entry.pool_lane && (
                      <p className="text-xs text-muted-foreground">Dráha: {entry.pool_lane}</p>
                    )}
                    {entry.coaches && (
                      <p className="text-xs text-muted-foreground mt-1">Tréner: {entry.coaches.full_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
