import { useClubContext } from "@/contexts/ClubContext"
import { useNews } from "@/hooks/useNews"
import { Card, CardContent } from "@/components/ui/card"
import { Waves } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"

export default function NewsPage() {
  const { club } = useClubContext()
  const { data: news, isLoading } = useNews(club?.id, 50)

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Novinky</h1>
        <p className="text-muted-foreground text-lg">Aktuality z klubu a plávacieho sveta.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Waves className="h-8 w-8 text-primary animate-pulse" />
        </div>
      )}

      {!isLoading && (!news || news.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <Waves className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>Žiadne aktuality momentálne nie sú k dispozícii.</p>
        </div>
      )}

      {news && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              {article.cover_image_url && (
                <img src={article.cover_image_url} alt={article.title_sk} className="w-full h-48 object-cover" />
              )}
              <CardContent className="pt-5 flex-1 flex flex-col">
                <p className="text-xs text-muted-foreground mb-2">
                  {format(new Date(article.published_at), "d. MMMM yyyy", { locale: sk })}
                </p>
                <h2 className="text-lg font-bold mb-3 leading-snug">{article.title_sk}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.body_sk}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
