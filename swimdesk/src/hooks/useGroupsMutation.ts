import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { TrainingGroup } from "@/integrations/supabase/types"

export function useGroupsMutation(clubId: string | undefined) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["training_groups", clubId] })

  const updateGroup = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TrainingGroup> & { id: string }) => {
      const { error } = await supabase.from("training_groups").update(patch).eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const addGroup = useMutation({
    mutationFn: async (group: Omit<TrainingGroup, "id" | "created_at">) => {
      const { error } = await supabase.from("training_groups").insert(group)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { addGroup, updateGroup }
}
