import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParentProfile } from "@/hooks/useParentProfile"
import { useSwimmers, useSwimmerMutations } from "@/hooks/useSwimmers"
import { useClubContext } from "@/contexts/ClubContext"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { SwimmerCard } from "@/components/parent/SwimmerCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Waves, X } from "lucide-react"
import { toast } from "sonner"

const schema = z.object({
  full_name: z.string().min(2, "Zadaj meno"),
  birth_year: z.coerce.number().int().min(1990).max(2030).optional(),
  group_id: z.string().optional(),
  paysy_member_id: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ChildrenPage() {
  const { club } = useClubContext()
  const { data: profile } = useParentProfile()
  const { data: swimmers, isLoading } = useSwimmers(profile?.id)
  const { data: groups } = useTrainingGroups(club?.id)
  const { addSwimmer, updateSwimmer } = useSwimmerMutations(club?.id, profile?.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showForm, setShowForm] = useState(false)

  const editId = searchParams.get("edit")
  const editingSwimmer = swimmers?.find((s) => s.id === editId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editingSwimmer
      ? { full_name: editingSwimmer.full_name, birth_year: editingSwimmer.birth_year ?? undefined, group_id: editingSwimmer.group_id ?? "", paysy_member_id: editingSwimmer.paysy_member_id ?? "" }
      : {},
  })

  const onSubmit = async (data: FormData) => {
    if (editingSwimmer) {
      await updateSwimmer.mutateAsync({ id: editingSwimmer.id, ...data })
      toast.success("Dieťa aktualizované")
      setSearchParams({})
    } else {
      await addSwimmer.mutateAsync(data)
      toast.success("Dieťa pridané")
      reset()
      setShowForm(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moje deti</h1>
        {!showForm && !editId && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Pridať dieťa
          </Button>
        )}
      </div>

      {/* Add / Edit form */}
      {(showForm || editId) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editId ? "Upraviť dieťa" : "Nové dieťa"}</CardTitle>
              <button onClick={() => { setShowForm(false); setSearchParams({}) }} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Meno dieťaťa</Label>
                <Input placeholder="Mária Nováková" {...register("full_name")} />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Rok narodenia</Label>
                <Input type="number" placeholder="2012" {...register("birth_year")} />
              </div>
              <div className="space-y-1.5">
                <Label>Tréningová skupina</Label>
                <select
                  {...register("group_id")}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Nezaradené —</option>
                  {groups?.map((g) => (
                    <option key={g.id} value={g.id}>{g.display_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Paysy ID</Label>
                <Input placeholder="napr. 12345" {...register("paysy_member_id")} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setSearchParams({}) }}>Zrušiť</Button>
                <Button type="submit" disabled={addSwimmer.isPending || updateSwimmer.isPending}>Uložiť</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Waves className="h-6 w-6 text-primary animate-pulse" />
        </div>
      ) : swimmers?.length ? (
        <div className="space-y-2">
          {swimmers.map((s) => <SwimmerCard key={s.id} swimmer={s} />)}
        </div>
      ) : !showForm ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Zatiaľ žiadne deti. Klikni na „Pridať dieťa".
        </div>
      ) : null}
    </div>
  )
}
