import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useClubContext } from "@/contexts/ClubContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Waves } from "lucide-react"
import type { ClubContent } from "@/integrations/supabase/types"

const SECTIONS = [
  { key: "hero_headline", label: "Hero tituľ", multiline: false },
  { key: "hero_subline", label: "Hero podtituľ", multiline: false },
  { key: "about", label: "O klube (text)", multiline: true },
  { key: "contact_address", label: "Adresa", multiline: false },
  { key: "contact_email", label: "Email", multiline: false },
  { key: "contact_phone", label: "Telefón", multiline: false },
]

export default function ClubCMSPage() {
  const { club } = useClubContext()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const { data: content, isLoading } = useQuery<ClubContent[]>({
    queryKey: ["club_content_admin", club?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_content")
        .select("*")
        .eq("club_id", club!.id)
        .order("sort_order")
      if (error) throw error
      // Initialize values from fetched data
      const init: Record<string, string> = {}
      ;(data ?? []).forEach((c) => { init[c.section] = c.content_sk ?? "" })
      setValues(init)
      return data ?? []
    },
    enabled: !!club?.id,
  })

  const upsert = useMutation({
    mutationFn: async ({ section, value }: { section: string; value: string }) => {
      const existing = content?.find((c) => c.section === section)
      if (existing) {
        const { error } = await supabase
          .from("club_content")
          .update({ content_sk: value, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("club_content")
          .insert({ club_id: club!.id, section, content_sk: value })
        if (error) throw error
      }
    },
    onSuccess: (_, { section }) => {
      setSaved((s) => ({ ...s, [section]: true }))
      setTimeout(() => setSaved((s) => ({ ...s, [section]: false })), 2000)
      queryClient.invalidateQueries({ queryKey: ["club_content", club?.id] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Waves className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Správa obsahu</h1>
        <p className="text-muted-foreground">Edituj texty zobrazené na verejnej webstránke klubu {club?.name}.</p>
      </div>

      <div className="flex flex-col gap-5">
        {SECTIONS.map(({ key, label, multiline }) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 items-end">
                {multiline ? (
                  <textarea
                    rows={4}
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder={`Zadaj ${label.toLowerCase()}…`}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Zadaj ${label.toLowerCase()}…`}
                  />
                )}
                <Button
                  size="sm"
                  onClick={() => upsert.mutate({ section: key, value: values[key] ?? "" })}
                  disabled={upsert.isPending}
                  variant={saved[key] ? "secondary" : "default"}
                  className="flex-shrink-0"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saved[key] ? "Uložené" : "Uložiť"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
