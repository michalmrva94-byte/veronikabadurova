import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useClubContext } from "@/contexts/ClubContext"
import { useAuth } from "@/contexts/AuthContext"
import type { PaysyMemberStatus } from "@/integrations/supabase/types"

export function usePaysyStatus() {
  const { club } = useClubContext()

  return useQuery<PaysyMemberStatus[]>({
    queryKey: ["paysy_status", club?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paysy_member_status")
        .select("*, swimmers(id, full_name)")
        .eq("club_id", club!.id)
        .order("imported_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as PaysyMemberStatus[]
    },
    enabled: !!club?.id,
  })
}

export function usePaysyOverride() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { club } = useClubContext()

  return useMutation({
    mutationFn: async ({
      id,
      override_status,
      override_note,
    }: {
      id: string
      override_status: string | null
      override_note: string | null
    }) => {
      const { error } = await supabase
        .from("paysy_member_status")
        .update({
          override_status,
          override_note,
          override_by: user?.id ?? null,
          overridden_at: override_status ? new Date().toISOString() : null,
        })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paysy_status", club?.id] })
      queryClient.invalidateQueries({ queryKey: ["payment_status"] })
    },
  })
}
