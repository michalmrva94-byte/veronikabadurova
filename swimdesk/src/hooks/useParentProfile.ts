import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { ParentProfile } from "@/integrations/supabase/types"

export function useParentProfile() {
  const { user } = useAuth()

  return useQuery<ParentProfile | null>({
    queryKey: ["parent_profile", user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
      if (error) throw error
      return data as ParentProfile
    },
    enabled: !!user,
  })
}

export function useUpdateParentProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<Pick<ParentProfile, "full_name" | "phone">>) => {
      if (!user) throw new Error("Not authenticated")
      const { error } = await supabase
        .from("parent_profiles")
        .update(patch)
        .eq("user_id", user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent_profile", user?.id] })
    },
  })
}
