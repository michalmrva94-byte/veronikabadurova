import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Club } from "@/integrations/supabase/types"

export function useClubMutation(clubId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<Club>) => {
      if (!clubId) throw new Error("No club ID")
      const { error } = await supabase
        .from("clubs")
        .update(patch)
        .eq("id", clubId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club"] })
    },
  })
}
