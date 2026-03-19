import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useClubContext } from "@/contexts/ClubContext"
import { useClubContent } from "@/hooks/useClubContent"
import { useClubMutation } from "@/hooks/useClubMutation"
import { useClubAdmins, useClubAdminsMutation } from "@/hooks/useClubAdmins"
import { RoleGate } from "@/components/admin/RoleGate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, Trash2, Waves } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { ClubAdminRole } from "@/integrations/supabase/types"

const clubSchema = z.object({
  name: z.string().min(1),
  full_name: z.string().optional(),
  city: z.string().optional(),
  founded_year: z.coerce.number().int().optional(),
  primary_color: z.string(),
  accent_color: z.string(),
})
type ClubFormData = z.infer<typeof clubSchema>

const ROLE_LABELS: Record<ClubAdminRole, string> = {
  owner: "Vlastník",
  admin: "Admin",
  editor: "Editor",
}

function ClubSettingsForm() {
  const { club } = useClubContext()
  const updateClub = useClubMutation(club?.id)

  const { register, handleSubmit, formState: { errors } } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: club?.name ?? "",
      full_name: club?.full_name ?? "",
      city: club?.city ?? "",
      founded_year: club?.founded_year ?? undefined,
      primary_color: club?.primary_color ?? "#0EA5E9",
      accent_color: club?.accent_color ?? "#38BDF8",
    },
  })

  const onSubmit = async (data: ClubFormData) => {
    await updateClub.mutateAsync({
      ...data,
      full_name: data.full_name || null,
      city: data.city || null,
      founded_year: data.founded_year ?? null,
    })
    toast.success("Nastavenia uložené")
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Informácie o klube</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Skratka názvu *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Plný názov</Label>
              <Input {...register("full_name")} />
            </div>
            <div className="space-y-1.5">
              <Label>Mesto</Label>
              <Input {...register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label>Rok vzniku</Label>
              <Input type="number" {...register("founded_year")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Primárna farba</Label>
              <div className="flex gap-2 items-center">
                <input type="color" {...register("primary_color")} className="h-9 w-14 rounded-lg border cursor-pointer" />
                <Input {...register("primary_color")} className="flex-1 font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Akcentová farba</Label>
              <div className="flex gap-2 items-center">
                <input type="color" {...register("accent_color")} className="h-9 w-14 rounded-lg border cursor-pointer" />
                <Input {...register("accent_color")} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={updateClub.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {updateClub.isPending ? "Ukladám…" : "Uložiť"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AdminsSection() {
  const { club } = useClubContext()
  const { data: admins, isLoading } = useClubAdmins(club?.id)
  const { changeRole, removeAdmin } = useClubAdminsMutation(club?.id)
  const queryClient = useQueryClient()

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<ClubAdminRole>("editor")

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: ClubAdminRole }) => {
      const { data, error } = await supabase.functions.invoke("lookup-user-by-email", {
        body: { email },
      })
      if (error) throw new Error(error.message)
      if (!data?.user_id) throw new Error("Používateľ s týmto emailom neexistuje. Musí sa najskôr zaregistrovať.")
      const { error: insertError } = await supabase.from("club_admins").insert({
        club_id: club!.id,
        user_id: data.user_id,
        role,
      })
      if (insertError) throw insertError
    },
    onSuccess: () => {
      toast.success("Admin pridaný")
      setInviteEmail("")
      queryClient.invalidateQueries({ queryKey: ["club_admins", club?.id] })
    },
    onError: (e: Error) => toast.error("Chyba", { description: e.message }),
  })

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Správcovia klubu</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Waves className="h-5 w-5 text-primary animate-pulse" />
        ) : (
          <div className="space-y-2">
            {admins?.map((admin) => (
              <div key={admin.user_id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                <span className="text-sm font-mono text-muted-foreground truncate flex-1">{admin.user_id}</span>
                <select
                  value={admin.role}
                  onChange={(e) => changeRole.mutate({ userId: admin.user_id, role: e.target.value as ClubAdminRole })}
                  className="text-xs border rounded px-2 py-1 bg-background"
                >
                  {(Object.entries(ROLE_LABELS) as [ClubAdminRole, string][]).map(([r, l]) => (
                    <option key={r} value={r}>{l}</option>
                  ))}
                </select>
                <Badge variant="outline">{ROLE_LABELS[admin.role]}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                  if (confirm("Odstrániť tohto správcu?")) removeAdmin.mutate(admin.user_id)
                }}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t space-y-3">
          <p className="text-sm font-medium">Pozvať nového správcu</p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@priklad.sk"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as ClubAdminRole)} className="border rounded px-2 py-1 bg-background text-sm">
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <Button size="sm" disabled={!inviteEmail || inviteMutation.isPending} onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}>
              {inviteMutation.isPending ? "…" : "Pridať"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Používateľ musí byť zaregistrovaný v SwimDesk.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ClubSettingsPage() {
  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Nastavenia klubu</h1>
      <ClubSettingsForm />
      <RoleGate minRole="owner">
        <AdminsSection />
      </RoleGate>
    </div>
  )
}
