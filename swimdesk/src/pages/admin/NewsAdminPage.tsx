import { useClubContext } from "@/contexts/ClubContext"
import { useNews } from "@/hooks/useNews"
import { useNewsMutation } from "@/hooks/useNewsMutation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link, useParams } from "react-router-dom"
import { Plus, Pencil, Trash2, Waves } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"
import { toast } from "sonner"

export default function NewsAdminPage() {
  const { slug } = useParams<{ slug: string }>()
  const { club } = useClubContext()
  const { data: articles, isLoading } = useNews(club?.id)
  const { deleteArticle } = useNewsMutation(club?.id)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Odstrániť článok "${title}"?`)) return
    await deleteArticle.mutateAsync(id)
    toast.success("Článok odstránený")
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novinky</h1>
        <Button asChild>
          <Link to={`/${slug}/admin/novinky/nova`}><Plus className="h-4 w-4 mr-1" /> Nový článok</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Waves className="h-6 w-6 text-primary animate-pulse" /></div>
      ) : !articles?.length ? (
        <p className="text-muted-foreground text-sm text-center py-10">Žiadne články.</p>
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.title_sk}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(a.published_at), "d. MMM yyyy", { locale: sk })}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${a.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {a.is_published ? "Publikovaný" : "Koncept"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/${slug}/admin/novinky/${a.id}`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id, a.title_sk)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
