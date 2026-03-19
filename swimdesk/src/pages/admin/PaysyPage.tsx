import { useState } from "react"
import { useClubContext } from "@/contexts/ClubContext"
import { usePaysyStatus, usePaysyOverride } from "@/hooks/usePaysyStatus"
import { PaysyUploader } from "@/components/admin/PaysyUploader"
import { PaysyOverrideDialog } from "@/components/admin/PaysyOverrideDialog"
import { PaymentStatusBadge } from "@/components/parent/PaymentStatusBadge"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Waves, AlertCircle, Pencil } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"
import type { PaysyMemberStatus } from "@/integrations/supabase/types"

export default function PaysyPage() {
  const { club } = useClubContext()
  const { data: statusRows, isLoading } = usePaysyStatus()
  const [activeTab, setActiveTab] = useState<"import" | "stav">("import")
  const [overrideRow, setOverrideRow] = useState<PaysyMemberStatus | null>(null)

  const { data: lastBatch } = useQuery({
    queryKey: ["last_paysy_import", club?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("paysy_import_batches")
        .select("imported_at, row_count, filename")
        .eq("club_id", club!.id)
        .order("imported_at", { ascending: false })
        .limit(1)
        .single()
      return data
    },
    enabled: !!club?.id,
  })

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <h1 className="text-2xl font-bold">Paysy integrácia</h1>

      {lastBatch && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Posledný import: {format(new Date(lastBatch.imported_at), "d. MMMM yyyy, HH:mm", { locale: sk })}
          {" · "}{lastBatch.row_count} záznamov
          {lastBatch.filename && ` · ${lastBatch.filename}`}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        {(["import", "stav"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "import" ? "Importy" : "Stav členov"}
          </button>
        ))}
      </div>

      {activeTab === "import" ? (
        <PaysyUploader />
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center py-10"><Waves className="h-6 w-6 text-primary animate-pulse" /></div>
          ) : !statusRows?.length ? (
            <p className="text-muted-foreground text-sm text-center py-10">Zatiaľ žiadne záznamy. Najskôr importuj CSV.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Meno</th>
                    <th className="text-left px-3 py-2 font-medium">Paysy ID</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">Sezóna</th>
                    <th className="text-left px-3 py-2 font-medium">Platný do</th>
                    <th className="text-left px-3 py-2 font-medium">Plavec</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {statusRows.map((row) => (
                    <tr key={row.id} className="border-t hover:bg-muted/30">
                      <td className="px-3 py-2">{row.full_name_csv}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.paysy_member_id}</td>
                      <td className="px-3 py-2">
                        <PaymentStatusBadge row={row} />
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{row.season ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.valid_until ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.swimmers ? (row.swimmers as { full_name: string }).full_name : <span className="text-amber-600 text-xs">Nenájdený</span>}
                      </td>
                      <td className="px-3 py-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOverrideRow(row)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <PaysyOverrideDialog row={overrideRow} onClose={() => setOverrideRow(null)} />
    </div>
  )
}
