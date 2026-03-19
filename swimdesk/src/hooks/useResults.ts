import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { CompetitionResult } from "@/integrations/supabase/types"

export function useResults(clubId: string | undefined, limit = 50) {
  return useQuery<CompetitionResult[]>({
    queryKey: ["results", clubId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competition_results")
        .select("*, training_groups(id, display_name, slug)")
        .eq("club_id", clubId!)
        .order("competition_date", { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data ?? []) as CompetitionResult[]
    },
    enabled: !!clubId,
  })
}
