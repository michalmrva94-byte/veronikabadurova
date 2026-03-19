import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { TrainingScheduleEntry } from "@/integrations/supabase/types"

export function useScheduleMutation(clubId: string | undefined) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["schedule", clubId] })

  const addSlot = useMutation({
    mutationFn: async (slot: Omit<TrainingScheduleEntry, "id" | "training_groups" | "coaches">) => {
      const { error } = await supabase.from("training_schedule").insert(slot)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const updateSlot = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TrainingScheduleEntry> & { id: string }) => {
      const { error } = await supabase.from("training_schedule").update(patch).eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("training_schedule").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { addSlot, updateSlot, deleteSlot }
}
