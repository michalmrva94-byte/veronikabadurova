import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Coach } from "@/integrations/supabase/types"

export function useCoaches(clubId: string | undefined) {
  return useQuery<Coach[]>({
    queryKey: ["coaches", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
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
