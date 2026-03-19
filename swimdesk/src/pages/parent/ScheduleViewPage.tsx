import { useParentProfile } from "@/hooks/useParentProfile"
import { useSwimmers } from "@/hooks/useSwimmers"
import { useChildSchedule } from "@/hooks/useChildSchedule"
import { DAY_NAMES, DAY_ORDER } from "@/lib/utils"
import { Waves } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

function SwimmerSchedule({ swimmer }: { swimmer: { id: string; full_name: string; group_id: string | null; training_groups?: { display_name: string } | null } }) {
  const { data: entries, isLoading } = useChildSchedule(swimmer.group_id)

  if (isLoading) return <Waves className="h-5 w-5 text-primary animate-pulse mx-auto" />

  const grouped: Record<string, typeof entries> = {}
  entries?.forEach((e) => {
    if (!grouped[e.day_of_week]) grouped[e.day_of_week] = []
    grouped[e.day_of_week]!.push(e)
  })

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">{swimmer.full_name}</h2>
      {!entries?.length ? (
        <p className="text-sm text-muted-foreground">Žiadny rozvrh pre túto skupinu.</p>
      ) : (
        DAY_ORDER.filter((d) => grouped[d]?.length).map((day) => (
          <div key={day}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{DAY_NAMES[day]}</p>
            <div className="space-y-1.5">
              {grouped[day]!.map((entry) => (
                <Card key={entry.id} className="bg-muted/30">
                  <CardContent className="py-3 flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.start_time.slice(0, 5)}–{entry.end_time.slice(0, 5)}</span>
                    <span className="text-muted-foreground">{entry.location ?? ""}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function ScheduleViewPage() {
  const { data: profile } = useParentProfile()
  const { data: swimmers, isLoading } = useSwimmers(profile?.id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Waves className="h-7 w-7 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold">Rozvrh tréningov</h1>
      {!swimmers?.length ? (
        <p className="text-muted-foreground text-sm">Pridaj dieťa, aby sa zobrazil jeho rozvrh.</p>
      ) : (
        swimmers.map((s) => <SwimmerSchedule key={s.id} swimmer={s} />)
      )}
    </div>
  )
}
