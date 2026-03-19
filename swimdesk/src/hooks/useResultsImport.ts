import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useClubContext } from "@/contexts/ClubContext"
import { parseSwimTime } from "@/lib/parseSwimTime"
import type { SwimDiscipline } from "@/integrations/supabase/types"

export interface ResultRow {
  competition_name: string
  competition_date: string
  swimmer_name: string
  discipline: string
  distance_m: number
  result_time: string
  place?: number
  is_personal_record?: boolean
  location?: string
}

export interface ImportStats {
  inserted: number
  skipped: number
  batchId: string
}

export function useResultsImport() {
  const { club } = useClubContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      rows,
      skipIds,
    }: {
      rows: ResultRow[]
      skipIds: Set<string>  // row indices to skip as duplicates
    }): Promise<ImportStats> => {
      if (!club) throw new Error("No club")

      // Fetch swimmers for group_id resolution
      const { data: swimmers } = await supabase
        .from("swimmers")
        .select("full_name, group_id")
        .eq("club_id", club.id)

      const swimmerGroupMap = new Map<string, string>()
      swimmers?.forEach((s) => {
        if (s.group_id) swimmerGroupMap.set(s.full_name.toLowerCase(), s.group_id)
      })

      const batchId = crypto.randomUUID()
      const toInsert = rows
        .filter((_, i) => !skipIds.has(String(i)))
        .map((row) => {
          const ms = parseSwimTime(row.result_time)
          if (!ms) return null
          return {
            club_id: club.id,
            competition_name: row.competition_name,
            competition_date: row.competition_date,
            location: row.location ?? null,
            swimmer_name: row.swimmer_name,
            group_id: swimmerGroupMap.get(row.swimmer_name.toLowerCase()) ?? null,
            discipline: row.discipline as SwimDiscipline,
            distance_m: row.distance_m,
            result_time_ms: ms,
            place: row.place ?? null,
            is_personal_record: row.is_personal_record ?? false,
            import_batch_id: batchId,
            import_source: "szps_csv",
          }
        })
        .filter(Boolean)

      if (toInsert.length === 0) return { inserted: 0, skipped: rows.length, batchId }

      const { error } = await supabase.from("competition_results").insert(toInsert)
      if (error) throw error

      return {
        inserted: toInsert.length,
        skipped: rows.length - toInsert.length,
        batchId,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results", club?.id] })
    },
  })
}
