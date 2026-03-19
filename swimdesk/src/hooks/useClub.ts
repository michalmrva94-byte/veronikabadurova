import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Club } from "@/integrations/supabase/types"

export function useClub(slug: string) {
  return useQuery<Club | null>({
    queryKey: ["club", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  })
}
