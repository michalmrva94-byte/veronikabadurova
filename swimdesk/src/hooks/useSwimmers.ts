import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Swimmer } from "@/integrations/supabase/types"

export function useSwimmers(parentId: string | undefined) {
  return useQuery<Swimmer[]>({
    queryKey: ["swimmers", parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swimmers")
        .select("*, training_groups(id, display_name, slug, color, icon_emoji)")
        .eq("parent_id", parentId!)
        .eq("is_active", true)
        .order("full_name")
      if (error) throw error
      return (data ?? []) as Swimmer[]
    },
    enabled: !!parentId,
  })
}

export function useClubSwimmers(clubId: string | undefined) {
  return useQuery<Swimmer[]>({
    queryKey: ["club_swimmers", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swimmers")
        .select("*, training_groups(id, display_name, slug, color, icon_emoji)")
        .eq("club_id", clubId!)
        .order("full_name")
      if (error) throw error
      return (data ?? []) as Swimmer[]
    },
    enabled: !!clubId,
  })
}

export function useSwimmerMutations(clubId: string | undefined, parentId: string | undefined) {
  const queryClient = useQueryClient()

  const addSwimmer = useMutation({
    mutationFn: async (swimmer: { full_name: string; birth_year?: number; group_id?: string; paysy_member_id?: string }) => {
      if (!clubId || !parentId) throw new Error("Missing IDs")
      const { error } = await supabase
        .from("swimmers")
        .insert({ ...swimmer, club_id: clubId, parent_id: parentId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimmers", parentId] })
      queryClient.invalidateQueries({ queryKey: ["club_swimmers", clubId] })
    },
  })

  const updateSwimmer = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Swimmer> & { id: string }) => {
      const { error } = await supabase
        .from("swimmers")
        .update(patch)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimmers", parentId] })
      queryClient.invalidateQueries({ queryKey: ["club_swimmers", clubId] })
    },
  })

  const deleteSwimmer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("swimmers")
        .update({ is_active: false })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimmers", parentId] })
    },
  })

  return { addSwimmer, updateSwimmer, deleteSwimmer }
}
