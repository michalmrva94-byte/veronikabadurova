import { useState } from "react"
import { useClubContext } from "@/contexts/ClubContext"
import { useSchedule } from "@/hooks/useSchedule"
import { useScheduleMutation } from "@/hooks/useScheduleMutation"
import { ScheduleSlotDialog } from "@/components/admin/ScheduleSlotDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Waves } from "lucide-react"
import { DAY_NAMES, DAY_ORDER } from "@/lib/utils"
import { toast } from "sonner"
import type { TrainingScheduleEntry } from "@/integrations/supabase/types"

export default function ScheduleAdminPage() {
  const { club } = useClubContext()
  const { data: schedule, isLoading } = useSchedule(club?.id)
  const { addSlot, updateSlot, deleteSlot } = useScheduleMutation(club?.id)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TrainingScheduleEntry | null>(null)

  const handleSave = async (data: Omit<TrainingScheduleEntry, "id" | "training_groups" | "coaches">) => {
    if (editing) {
      await updateSlot.mutateAsync({ id: editing.id, ...data })
      toast.success("Slot aktualizovaný")
    } else {
      await addSlot.mutateAsync(data)
      toast.success("Slot pridaný")
    }
    setEditing(null)
  }

  const handleDelete = async (slot: TrainingScheduleEntry) => {
    if (!confirm("Odstrániť tento slot?")) return
    await deleteSlot.mutateAsync(slot.id)
    toast.success("Slot odstránený")
  }

  if (isLoading) return <div className="flex justify-center py-20"><Waves className="h-6 w-6 text-primary animate-pulse" /></div>

  const grouped: Record<string, TrainingScheduleEntry[]> = {}
  schedule?.forEach((s) => {
    if (!grouped[s.day_of_week]) grouped[s.day_of_week] = []
    grouped[s.day_of_week].push(s)
  })

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rozvrh tréningov</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> Pridať slot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAY_ORDER.map((day) => (
          <div key={day} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{DAY_NAMES[day]}</h3>
            {(grouped[day] ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time)).map((slot) => (
              <Card key={slot.id} className={!slot.is_active ? "opacity-50" : ""}>
                <CardContent className="py-3 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                    </p>
                    {slot.training_groups && (
                      <p className="text-xs text-muted-foreground">{(slot.training_groups as { display_name: string }).display_name}</p>
                    )}
                    {slot.location && <p className="text-xs text-muted-foreground">{slot.location}{slot.pool_lane ? `, dr. ${slot.pool_lane}` : ""}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(slot); setDialogOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(slot)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!(grouped[day]?.length) && (
              <p className="text-xs text-muted-foreground italic">Žiadny tréning</p>
            )}
          </div>
        ))}
      </div>

      <ScheduleSlotDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
