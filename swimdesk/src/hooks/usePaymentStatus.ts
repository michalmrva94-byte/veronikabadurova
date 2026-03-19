import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { PaysyMemberStatus } from "@/integrations/supabase/types"

export function usePaymentStatus(swimmerId: string | null | undefined) {
  return useQuery<PaysyMemberStatus | null>({
    queryKey: ["payment_status", swimmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paysy_member_status")
        .select("*")
        .eq("swimmer_id", swimmerId!)
        .order("imported_at", { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== "PGRST116") throw error
      return (data as PaysyMemberStatus) ?? null
    },
    enabled: !!swimmerId,
  })
}

/** Returns the effective status: override_status if set, else status */
export function effectiveStatus(row: PaysyMemberStatus | null | undefined): string | null {
  if (!row) return null
  return row.override_status ?? row.status
}
