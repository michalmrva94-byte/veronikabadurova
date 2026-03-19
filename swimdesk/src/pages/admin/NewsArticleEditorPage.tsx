import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useClubContext } from "@/contexts/ClubContext"
import { useNews } from "@/hooks/useNews"
import { useNewsMutation } from "@/hooks/useNewsMutation"
import { slugify } from "@/lib/slugify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Waves, ChevronLeft, Eye, Edit2 } from "lucide-react"
import { toast } from "sonner"
import MDEditor from "@uiw/react-md-editor"

const schema = z.object({
  title_sk: z.string().min(1, "Zadaj tituľ"),
  body_sk: z.string().min(1, "Článok nemôže byť prázdny"),
  cover_image_url: z.string().optional(),
  published_at: z.string(),
  is_published: z.boolean().default(false),
})
type FormData = z.infer<typeof schema>

export default function NewsArticleEditorPage() {
  const { slug, id } = useParams<{ slug: string; id?: string }>()
  const navigate = useNavigate()
  const { club } = useClubContext()
  const { data: articles } = useNews(club?.id)
  const { addArticle, updateArticle } = useNewsMutation(club?.id)
  const isNew = id === undefined

  const existing = articles?.find((a) => a.id === id)

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title_sk: existing?.title_sk ?? "",
      body_sk: existing?.body_sk ?? "",
      cover_image_url: existing?.cover_image_url ?? "",
      published_at: existing?.published_at ?? new Date().toISOString().slice(0, 10),
      is_published: existing?.is_published ?? false,
    },
  })

  const [previewMode, setPreviewMode] = useState(false)
  const titleSk = watch("title_sk")
  const isPublished = watch("is_published")

  // Fill defaults from existing after articles loaded
  useEffect(() => {
    if (existing) {
      setValue("title_sk", existing.title_sk)
      setValue("body_sk", existing.body_sk)
      setValue("cover_image_url", existing.cover_image_url ?? "")
      setValue("published_at", existing.published_at.slice(0, 10))
      setValue("is_published", existing.is_published)
    }
  }, [existing])

  const onSubmit = async (data: FormData) => {
    const articleSlug = isNew ? slugify(data.title_sk) : (existing?.slug ?? slugify(data.title_sk))
    const payload = {
      ...data,
      club_id: club!.id,
      slug: articleSlug,
      cover_image_url: data.cover_image_url || null,
      published_at: new Date(data.published_at).toISOString(),
    }

    if (isNew) {
      await addArticle.mutateAsync(payload)
      toast.success("Článok vytvorený")
    } else {
      await updateArticle.mutateAsync({ id: id!, ...payload })
      toast.success("Článok uložený")
    }
    navigate(`/${slug}/admin/novinky`)
  }

  if (!isNew && !existing && articles) {
    return <div className="p-6 text-muted-foreground">Článok nebol nájdený.</div>
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/${slug}/admin/novinky`)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{isNew ? "Nový článok" : "Upraviť článok"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Tituľ *</Label>
          <Input {...register("title_sk")} placeholder="Nadpis článku" className="text-lg font-semibold" />
          {errors.title_sk && <p className="text-xs text-destructive">{errors.title_sk.message}</p>}
          {titleSk && <p className="text-xs text-muted-foreground">Slug: {slugify(titleSk)}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Obsah *</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? <><Edit2 className="h-4 w-4 mr-1" />Editovať</> : <><Eye className="h-4 w-4 mr-1" />Náhľad</>}
            </Button>
          </div>
          <Controller
            name="body_sk"
            control={control}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={(val) => field.onChange(val ?? "")}
                preview={previewMode ? "preview" : "edit"}
                height={400}
              />
            )}
          />
          {errors.body_sk && <p className="text-xs text-destructive">{errors.body_sk.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Dátum publikovania</Label>
            <Input type="date" {...register("published_at")} />
          </div>
          <div className="space-y-1.5">
            <Label>Titulný obrázok (URL)</Label>
            <Input type="url" placeholder="https://…" {...register("cover_image_url")} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isPublished} onCheckedChange={(v) => setValue("is_published", v)} />
          <Label>{isPublished ? "Publikovaný" : "Koncept"}</Label>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Uložiť</Button>
          <Button type="button" variant="outline" onClick={() => navigate(`/${slug}/admin/novinky`)}>Zrušiť</Button>
        </div>
      </form>
    </div>
  )
}
