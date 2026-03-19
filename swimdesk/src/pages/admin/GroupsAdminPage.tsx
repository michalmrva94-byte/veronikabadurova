import { useState } from "react"
import { useClubContext } from "@/contexts/ClubContext"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { useGroupsMutation } from "@/hooks/useGroupsMutation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, X, Check, Waves } from "lucide-react"
import { toast } from "sonner"
import type { TrainingGroup } from "@/integrations/supabase/types"

function GroupRow({ group }: { group: TrainingGroup }) {
  const { club } = useClubContext()
  const { updateGroup } = useGroupsMutation(club?.id)
  const [editing, setEditing] = useState(false)
  const [vals, setVals] = useState({
    display_name: group.display_name,
    description_sk: group.description_sk ?? "",
    color: group.color ?? "#0EA5E9",
    icon_emoji: group.icon_emoji ?? "",
    age_from: group.age_from ?? "",
    age_to: group.age_to ?? "",
  })

  const save = async () => {
    await updateGroup.mutateAsync({
      id: group.id,
      display_name: vals.display_name,
      description_sk: vals.description_sk || null,
      color: vals.color || null,
      icon_emoji: vals.icon_emoji || null,
      age_from: vals.age_from ? Number(vals.age_from) : null,
      age_to: vals.age_to ? Number(vals.age_to) : null,
    })
    toast.success("Skupina uložená")
    setEditing(false)
  }

  if (!editing) {
    return (
      <Card>
        <CardContent className="py-3 flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: group.color ? `${group.color}30` : undefined, color: group.color ?? undefined }}
          >
            {group.icon_emoji || group.display_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{group.display_name}</p>
            {(group.age_from || group.age_to) && (
              <p className="text-xs text-muted-foreground">{group.age_from}–{group.age_to} rokov</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary">
      <CardContent className="py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Názov skupiny</Label>
            <Input value={vals.display_name} onChange={(e) => setVals((v) => ({ ...v, display_name: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Emoji ikona</Label>
            <Input value={vals.icon_emoji} onChange={(e) => setVals((v) => ({ ...v, icon_emoji: e.target.value }))} placeholder="🏊" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Vek od</Label>
            <Input type="number" value={vals.age_from} onChange={(e) => setVals((v) => ({ ...v, age_from: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Vek do</Label>
            <Input type="number" value={vals.age_to} onChange={(e) => setVals((v) => ({ ...v, age_to: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Farba</Label>
            <input type="color" value={vals.color} onChange={(e) => setVals((v) => ({ ...v, color: e.target.value }))} className="h-9 w-full rounded-lg border cursor-pointer" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Popis (SK)</Label>
          <textarea rows={2} value={vals.description_sk} onChange={(e) => setVals((v) => ({ ...v, description_sk: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
          <Button type="button" size="sm" onClick={save} disabled={updateGroup.isPending}><Check className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function GroupsAdminPage() {
  const { club } = useClubContext()
  const { data: groups, isLoading } = useTrainingGroups(club?.id)

  if (isLoading) return <div className="flex justify-center py-20"><Waves className="h-6 w-6 text-primary animate-pulse" /></div>

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Tréningové skupiny</h1>
      {groups?.map((g) => <GroupRow key={g.id} group={g} />)}
    </div>
  )
}
