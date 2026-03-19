import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { NewsArticle } from "@/integrations/supabase/types"

export function useNewsMutation(clubId: string | undefined) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["news", clubId] })

  const addArticle = useMutation({
    mutationFn: async (article: Omit<NewsArticle, "id">) => {
      const { error } = await supabase.from("news").insert(article)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const updateArticle = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<NewsArticle> & { id: string }) => {
      const { error } = await supabase.from("news").update(patch).eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { addArticle, updateArticle, deleteArticle }
}
