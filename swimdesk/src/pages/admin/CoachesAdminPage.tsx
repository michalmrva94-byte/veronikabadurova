import { useState } from "react"
import { useClubContext } from "@/contexts/ClubContext"
import { useCoaches } from "@/hooks/useCoaches"
import { useCoachesMutation } from "@/hooks/useCoachesMutation"
import { CoachFormDialog } from "@/components/admin/CoachFormDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Waves } from "lucide-react"
import { toast } from "sonner"
import { GROUP_DISPLAY } from "@/lib/utils"
import type { Coach } from "@/integrations/supabase/types"

export default function CoachesAdminPage() {
  const { club } = useClubContext()
  const { data: coaches, isLoading } = useCoaches(club?.id)
  const { addCoach, updateCoach, deleteCoach } = useCoachesMutation(club?.id)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coach | null>(null)

  const handleSave = async (data: Omit<Coach, "id" | "created_at" | "updated_at">) => {
    if (editing) {
      await updateCoach.mutateAsync({ id: editing.id, ...data })
      toast.success("Kouč aktualizovaný")
    } else {
      await addCoach.mutateAsync(data)
      toast.success("Kouč pridaný")
    }
    setEditing(null)
  }

  const handleDelete = async (coach: Coach) => {
    if (!confirm(`Odstrániť kouča ${coach.full_name}?`)) return
    await deleteCoach.mutateAsync(coach.id)
    toast.success("Kouč odstránený")
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trénerský tím</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> Pridať kouča
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Waves className="h-6 w-6 text-primary animate-pulse" /></div>
      ) : !coaches?.length ? (
        <p className="text-muted-foreground text-sm text-center py-10">Žiadni koučovia.</p>
      ) : (
        <div className="space-y-2">
          {coaches.map((coach) => (
            <Card key={coach.id} className={!coach.is_active ? "opacity-50" : ""}>
              <CardContent className="py-3 flex items-center gap-3">
                {coach.photo_url ? (
                  <img src={coach.photo_url} alt={coach.full_name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground font-bold text-sm">
                    {coach.full_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{coach.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[coach.title, (coach.groups as string[] ?? []).map((g) => GROUP_DISPLAY[g]).join(", ")].filter(Boolean).join(" · ")}
                    {!coach.is_active && " · Neaktívny"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(coach); setDialogOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(coach)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CoachFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
