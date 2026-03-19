import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { useCoaches } from "@/hooks/useCoaches"
import { useClubContext } from "@/contexts/ClubContext"
import type { TrainingScheduleEntry, DayOfWeek } from "@/integrations/supabase/types"
import { DAY_NAMES, DAY_ORDER } from "@/lib/utils"

const schema = z.object({
  group_id: z.string().min(1, "Vyber skupinu"),
  day_of_week: z.string().min(1),
  start_time: z.string().min(1, "Zadaj čas začiatku"),
  end_time: z.string().min(1, "Zadaj čas konca"),
  location: z.string().optional(),
  pool_lane: z.string().optional(),
  coach_id: z.string().optional(),
  is_active: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<TrainingScheduleEntry, "id" | "training_groups" | "coaches">) => Promise<void>
  initial?: TrainingScheduleEntry | null
}

export function ScheduleSlotDialog({ open, onClose, onSave, initial }: Props) {
  const { club } = useClubContext()
  const { data: groups } = useTrainingGroups(club?.id)
  const { data: coaches } = useCoaches(club?.id)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      group_id: initial?.group_id ?? "",
      day_of_week: initial?.day_of_week ?? "",
      start_time: initial?.start_time ?? "",
      end_time: initial?.end_time ?? "",
      location: initial?.location ?? "",
      pool_lane: initial?.pool_lane ?? "",
      coach_id: initial?.coach_id ?? "",
      is_active: initial?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormData) => {
    await onSave({
      ...data,
      club_id: club!.id,
      day_of_week: data.day_of_week as DayOfWeek,
      location: data.location || null,
      pool_lane: data.pool_lane || null,
      coach_id: data.coach_id || null,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Upraviť slot" : "Nový tréningový slot"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Skupina *</Label>
            <select {...register("group_id")} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">— Vyber skupinu —</option>
              {groups?.map((g) => <option key={g.id} value={g.id}>{g.display_name}</option>)}
            </select>
            {errors.group_id && <p className="text-xs text-destructive">{errors.group_id.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Deň *</Label>
            <select {...register("day_of_week")} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">— Vyber deň —</option>
              {DAY_ORDER.map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Začiatok *</Label>
              <Input type="time" {...register("start_time")} />
              {errors.start_time && <p className="text-xs text-destructive">{errors.start_time.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Koniec *</Label>
              <Input type="time" {...register("end_time")} />
              {errors.end_time && <p className="text-xs text-destructive">{errors.end_time.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Miesto</Label>
              <Input placeholder="Zimný štadión" {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label>Dráha</Label>
              <Input placeholder="1-3" {...register("pool_lane")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kouč</Label>
            <select {...register("coach_id")} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">— Bez kouča —</option>
              {coaches?.filter(c => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Zrušiť</Button>
            <Button type="submit">Uložiť</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
