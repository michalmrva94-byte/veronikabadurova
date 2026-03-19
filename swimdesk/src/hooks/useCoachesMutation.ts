import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Coach } from "@/integrations/supabase/types"

export function useCoachesMutation(clubId: string | undefined) {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["coaches", clubId] })

  const addCoach = useMutation({
    mutationFn: async (coach: Omit<Coach, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("coaches").insert(coach)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const updateCoach = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Coach> & { id: string }) => {
      const { error } = await supabase.from("coaches").update(patch).eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const deleteCoach = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coaches").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const reorderCoaches = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, i) =>
        supabase.from("coaches").update({ sort_order: i + 1 }).eq("id", id)
      )
      await Promise.all(updates)
    },
    onSuccess: invalidate,
  })

  return { addCoach, updateCoach, deleteCoach, reorderCoaches }
}
