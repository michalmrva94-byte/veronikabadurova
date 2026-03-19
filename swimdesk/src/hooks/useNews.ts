import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { NewsArticle } from "@/integrations/supabase/types"

export function useNews(clubId: string | undefined, limit = 20) {
  return useQuery<NewsArticle[]>({
    queryKey: ["news", clubId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("club_id", clubId!)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
    enabled: !!clubId,
  })
}
