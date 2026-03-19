import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { TrainingScheduleEntry } from "@/integrations/supabase/types"

export function useSchedule(clubId: string | undefined) {
  return useQuery<TrainingScheduleEntry[]>({
    queryKey: ["schedule", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_schedule")
        .select("*, training_groups(id, slug, display_name, color, icon_emoji), coaches(id, full_name)")
        .eq("club_id", clubId!)
        .eq("is_active", true)
      if (error) throw error
      return (data ?? []) as TrainingScheduleEntry[]
    },
    enabled: !!clubId,
  })
}
