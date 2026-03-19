import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { usePaysyOverride } from "@/hooks/usePaysyStatus"
import { toast } from "sonner"
import type { PaysyMemberStatus } from "@/integrations/supabase/types"

const STATUSES = [
  { value: "", label: "— Žiadna korekcia —" },
  { value: "active", label: "Aktívny" },
  { value: "pending", label: "Čakajúci" },
  { value: "expired", label: "Vypršaný" },
  { value: "inactive", label: "Neaktívny" },
]

interface Props {
  row: PaysyMemberStatus | null
  onClose: () => void
}

export function PaysyOverrideDialog({ row, onClose }: Props) {
  const override = usePaysyOverride()
  const [status, setStatus] = useState(row?.override_status ?? "")
  const [note, setNote] = useState(row?.override_note ?? "")

  const save = async () => {
    if (!row) return
    await override.mutateAsync({
      id: row.id,
      override_status: status || null,
      override_note: note || null,
    })
    toast.success("Korekcia uložená")
    onClose()
  }

  return (
    <Dialog open={!!row} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Korekcia statusu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{row?.full_name_csv} · ID {row?.paysy_member_id}</p>
          <p className="text-sm">Aktuálny status z Paysy: <strong>{row?.status}</strong></p>

          <div className="space-y-1.5">
            <Label>Korekcia statusu</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Poznámka</Label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dôvod korekcie…"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Zrušiť</Button>
            <Button onClick={save} disabled={override.isPending}>Uložiť</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
