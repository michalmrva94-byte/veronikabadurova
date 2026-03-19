import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { ClubContent } from "@/integrations/supabase/types"

export function useClubContent(clubId: string | undefined) {
  return useQuery<ClubContent[]>({
    queryKey: ["club_content", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_content")
        .select("*")
        .eq("club_id", clubId!)
        .eq("is_visible", true)
        .order("sort_order")
      if (error) throw error
      return data ?? []
    },
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5,
  })
}

/** Helper: get a single content section value */
export function useContentSection(clubId: string | undefined, section: string): string {
  const { data } = useClubContent(clubId)
  return data?.find((c) => c.section === section)?.content_sk ?? ""
}
