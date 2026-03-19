import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useClubContext } from "@/contexts/ClubContext"

export interface PaysyRow {
  paysy_member_id: string
  full_name_csv: string
  status: string
  season?: string
  valid_until?: string
}

export function usePaysyImport() {
  const { user } = useAuth()
  const { club } = useClubContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rows, filename, season }: { rows: PaysyRow[]; filename?: string; season?: string }) => {
      if (!user || !club) throw new Error("Not authenticated")

      // 1. Create import batch
      const { data: batch, error: batchError } = await supabase
        .from("paysy_import_batches")
        .insert({
          club_id: club.id,
          imported_by: user.id,
          row_count: rows.length,
          filename: filename ?? null,
          season: season ?? null,
        })
        .select()
        .single()

      if (batchError || !batch) throw batchError ?? new Error("Failed to create batch")

      // 2. Match swimmers by paysy_member_id
      const { data: swimmers } = await supabase
        .from("swimmers")
        .select("id, paysy_member_id")
        .eq("club_id", club.id)
        .not("paysy_member_id", "is", null)

      const swimmerMap = new Map<string, string>()
      swimmers?.forEach((s) => {
        if (s.paysy_member_id) swimmerMap.set(s.paysy_member_id, s.id)
      })

      // 3. Upsert status rows
      const statusRows = rows.map((row) => ({
        club_id: club.id,
        swimmer_id: swimmerMap.get(row.paysy_member_id) ?? null,
        paysy_member_id: row.paysy_member_id,
        full_name_csv: row.full_name_csv,
        status: row.status,
        season: row.season ?? null,
        valid_until: row.valid_until ?? null,
        import_batch_id: batch.id,
      }))

      const { error: statusError } = await supabase
        .from("paysy_member_status")
        .insert(statusRows)

      if (statusError) throw statusError

      return batch
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paysy_status"] })
      queryClient.invalidateQueries({ queryKey: ["last_paysy_import"] })
      queryClient.invalidateQueries({ queryKey: ["payment_status"] })
    },
  })
}
