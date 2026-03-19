import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { DAY_ORDER } from "@/lib/utils"
import type { TrainingScheduleEntry } from "@/integrations/supabase/types"

export function useChildSchedule(groupId: string | null | undefined) {
  return useQuery<TrainingScheduleEntry[]>({
    queryKey: ["child_schedule", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_schedule")
        .select("*, training_groups(id, display_name, slug, color, icon_emoji), coaches(id, full_name)")
        .eq("group_id", groupId!)
        .eq("is_active", true)
      if (error) throw error

      // Sort by DAY_ORDER then start_time
      return ((data ?? []) as TrainingScheduleEntry[]).sort((a, b) => {
        const dayDiff = DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
        if (dayDiff !== 0) return dayDiff
        return a.start_time.localeCompare(b.start_time)
      })
    },
    enabled: !!groupId,
  })
}

/** Returns the next training datetime for a given set of schedule entries */
export function getNextTraining(entries: TrainingScheduleEntry[]): Date | null {
  if (!entries.length) return null

  const now = new Date()
  const todayDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0..Sun=6

  for (let offset = 0; offset < 8; offset++) {
    const dayIndex = (todayDayIndex + offset) % 7
    const dayName = DAY_ORDER[dayIndex]
    const slotsForDay = entries.filter((e) => e.day_of_week === dayName)

    for (const slot of slotsForDay.sort((a, b) => a.start_time.localeCompare(b.start_time))) {
      const [h, m] = slot.start_time.split(":").map(Number)
      const candidate = new Date(now)
      candidate.setDate(now.getDate() + offset)
      candidate.setHours(h, m, 0, 0)

      if (candidate > now) return candidate
    }
  }
  return null
}
