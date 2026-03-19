import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { ClubAdminRole } from "@/integrations/supabase/types"

interface ClubAdmin {
  club_id: string
  user_id: string
  role: ClubAdminRole
}

export function useClubAdmins(clubId: string | undefined) {
  return useQuery<ClubAdmin[]>({
    queryKey: ["club_admins", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_admins")
        .select("club_id, user_id, role")
        .eq("club_id", clubId!)
      if (error) throw error
      return (data ?? []) as ClubAdmin[]
    },
    enabled: !!clubId,
  })
}

export function useClubAdminsMutation(clubId: string | undefined) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["club_admins", clubId] })

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: ClubAdminRole }) => {
      const { error } = await supabase
        .from("club_admins")
        .update({ role })
        .eq("club_id", clubId!)
        .eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removeAdmin = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("club_admins")
        .delete()
        .eq("club_id", clubId!)
        .eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { changeRole, removeAdmin }
}
