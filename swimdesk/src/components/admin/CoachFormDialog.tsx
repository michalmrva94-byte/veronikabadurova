import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/integrations/supabase/client"
import type { Coach, SwimDiscipline, SwimmerGroup } from "@/integrations/supabase/types"
import { DISCIPLINE_DISPLAY, GROUP_DISPLAY } from "@/lib/utils"
import { useClubContext } from "@/contexts/ClubContext"
import { toast } from "sonner"

const DISCIPLINES: SwimDiscipline[] = ["volny", "znak", "prsia", "motyl", "kombinacia"]
const GROUPS: SwimmerGroup[] = ["benjamini", "ziaci", "juniori", "seniori"]

const schema = z.object({
  full_name: z.string().min(2, "Zadaj meno"),
  title: z.string().optional(),
  bio_sk: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  sort_order: z.coerce.number().int().default(99),
  is_active: z.boolean().default(true),
  specialization: z.array(z.string()).default([]),
  groups: z.array(z.string()).default([]),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Coach, "id" | "created_at" | "updated_at">) => Promise<void>
  initial?: Coach | null
}

export function CoachFormDialog({ open, onClose, onSave, initial }: Props) {
  const { club } = useClubContext()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      title: initial?.title ?? "",
      bio_sk: initial?.bio_sk ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      sort_order: initial?.sort_order ?? 99,
      is_active: initial?.is_active ?? true,
      specialization: (initial?.specialization as string[]) ?? [],
      groups: (initial?.groups as string[]) ?? [],
    },
  })

  const specialization = watch("specialization")
  const groups = watch("groups")
  const isActive = watch("is_active")

  const toggleItem = (field: "specialization" | "groups", value: string) => {
    const current = field === "specialization" ? specialization : groups
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setValue(field, updated)
  }

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    let photo_url = initial?.photo_url ?? null

    if (photoFile && club) {
      const ext = photoFile.name.split(".").pop()
      const path = `${club.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from("coach-photos").upload(path, photoFile)
      if (uploadError) {
        toast.error("Chyba pri nahrávaní fotky", { description: uploadError.message })
        setUploading(false)
        return
      }
      const { data: urlData } = supabase.storage.from("coach-photos").getPublicUrl(path)
      photo_url = urlData.publicUrl
    }

    await onSave({
      ...data,
      club_id: club!.id,
      photo_url,
      specialization: data.specialization as SwimDiscipline[],
      groups: data.groups as SwimmerGroup[],
      email: data.email || null,
      title: data.title || null,
      bio_sk: data.bio_sk || null,
      phone: data.phone || null,
    })
    setUploading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Upraviť kouča" : "Nový kouč"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Meno *</Label>
            <Input {...register("full_name")} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Titul (napr. "Mgr.")</Label>
            <Input {...register("title")} />
          </div>
          <div className="space-y-1.5">
            <Label>Bio (SK)</Label>
            <textarea rows={3} {...register("bio_sk")} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefón</Label>
              <Input {...register("phone")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Foto</Label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="text-sm" />
            {initial?.photo_url && !photoFile && (
              <img src={initial.photo_url} alt="foto" className="h-12 w-12 rounded-full object-cover" />
            )}
          </div>

          <div className="space-y-2">
            <Label>Špecializácia</Label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <button key={d} type="button" onClick={() => toggleItem("specialization", d)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${specialization.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {DISCIPLINE_DISPLAY[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skupiny</Label>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <button key={g} type="button" onClick={() => toggleItem("groups", g)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${groups.includes(g) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {GROUP_DISPLAY[g]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} />
            <Label>Aktívny</Label>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Zrušiť</Button>
            <Button type="submit" disabled={uploading}>{uploading ? "Ukladám…" : "Uložiť"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
