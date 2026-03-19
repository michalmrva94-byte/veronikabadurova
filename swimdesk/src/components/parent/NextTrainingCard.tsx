import { useEffect, useState } from "react"
import { useChildSchedule, getNextTraining } from "@/hooks/useChildSchedule"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, Waves } from "lucide-react"
import { DAY_NAMES, DAY_ORDER } from "@/lib/utils"
import type { TrainingScheduleEntry } from "@/integrations/supabase/types"

function formatCountdown(target: Date): string {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return "Práve teraz"

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (days > 0) return `Za ${days}d ${hours}h ${String(mins).padStart(2, "0")}m`
  if (hours > 0) return `Za ${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
  return `Za ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

function findSlotForDate(entries: TrainingScheduleEntry[], target: Date): TrainingScheduleEntry | undefined {
  const dayIndex = target.getDay() === 0 ? 6 : target.getDay() - 1
  const dayName = DAY_ORDER[dayIndex]
  return entries.filter((e) => e.day_of_week === dayName).sort((a, b) => a.start_time.localeCompare(b.start_time))[0]
}

interface Props {
  groupId: string | null | undefined
  swimmerName: string
}

export function NextTrainingCard({ groupId, swimmerName }: Props) {
  const { data: entries, isLoading } = useChildSchedule(groupId)
  const [countdown, setCountdown] = useState<string>("")
  const [nextDate, setNextDate] = useState<Date | null>(null)

  useEffect(() => {
    if (!entries?.length) return
    const target = getNextTraining(entries)
    setNextDate(target)

    if (!target) return
    const update = () => setCountdown(formatCountdown(target))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [entries])

  if (!groupId) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-6 text-center text-muted-foreground text-sm">
          {swimmerName} nie je zaradený/á do žiadnej skupiny.
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex justify-center">
          <Waves className="h-6 w-6 text-primary animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const slot = nextDate && entries ? findSlotForDate(entries, nextDate) : undefined

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-primary" />
      <CardContent className="py-5">
        <div className="flex items-start gap-3">
          <CalendarClock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium">{swimmerName} — ďalší tréning</p>
            {nextDate && slot ? (
              <>
                <p className="text-lg font-bold mt-0.5">
                  {DAY_NAMES[slot.day_of_week]} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                </p>
                {slot.location && (
                  <p className="text-sm text-muted-foreground">{slot.location}{slot.pool_lane ? `, dráha ${slot.pool_lane}` : ""}</p>
                )}
                <p className="text-2xl font-mono font-bold text-primary mt-2">{countdown}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Žiadny tréning v rozvrhu.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
