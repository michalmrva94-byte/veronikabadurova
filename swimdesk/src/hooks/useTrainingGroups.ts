import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { TrainingGroup } from "@/integrations/supabase/types"

export function useTrainingGroups(clubId: string | undefined) {
  return useQuery<TrainingGroup[]>({
    queryKey: ["training_groups", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_groups")
        .select("*")
        .eq("club_id", clubId!)
        .eq("is_active", true)
        .order("sort_order")
      if (error) throw error
      return data ?? []
    },
    enabled: !!clubId,
  })
}
