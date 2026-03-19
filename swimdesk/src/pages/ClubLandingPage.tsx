import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Waves, Trophy, Users, Calendar, ChevronRight } from "lucide-react"
import { useClubContext } from "@/contexts/ClubContext"
import { useClubContent } from "@/hooks/useClubContent"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { useNews } from "@/hooks/useNews"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GroupBadge } from "@/components/club/GroupBadge"
import { format } from "date-fns"
import { sk } from "date-fns/locale"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export default function ClubLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const { club } = useClubContext()
  const { data: content } = useClubContent(club?.id)
  const { data: groups } = useTrainingGroups(club?.id)
  const { data: news } = useNews(club?.id, 3)

  const base = `/${slug}`
  const get = (section: string) => content?.find((c) => c.section === section)?.content_sk ?? ""

  return (
    <div>
      {/* ---- HERO ---- */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-swim-deep to-primary py-24 md:py-36 text-white"
        style={{ background: `linear-gradient(135deg, ${club?.accent_color ?? "#0284C7"}, ${club?.primary_color ?? "#0EA5E9"})` }}
      >
        {/* Water wave SVG decoration */}
        <div className="absolute bottom-0 left-0 right-0 opacity-20">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-2xl"
          >
            {club?.logo_url && (
              <motion.img
                variants={fadeUp}
                custom={0}
                src={club.logo_url}
                alt={club.name}
                className="h-20 w-20 object-contain mb-6 rounded-2xl bg-white/20 p-2"
              />
            )}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl font-bold leading-tight mb-4"
            >
              {get("hero_headline") || club?.full_name || club?.name}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed"
            >
              {get("hero_subline") || "Plavecký klub · Tréningy, preteky, komunita."}
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to={`${base}/skupiny`}>
                  Naše skupiny <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to={`${base}/kontakt`}>Kontakt</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---- QUICK STATS ---- */}
      <section className="border-b bg-muted/40">
        <div className="container py-8 grid grid-cols-3 divide-x text-center">
          {[
            { icon: <Waves className="h-5 w-5" />, label: "Tréningov/týždeň", value: groups ? `${(groups.length * 3)}+` : "—" },
            { icon: <Users className="h-5 w-5" />, label: "Skupiny", value: groups?.length ?? "—" },
            { icon: <Trophy className="h-5 w-5" />, label: "Sezóna", value: new Date().getFullYear() },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-4 py-2">
              <div className="text-primary mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- ABOUT ---- */}
      {get("about") && (
        <section className="container py-16 md:py-24 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">O klube</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{get("about")}</p>
            {club?.founded_year && (
              <p className="mt-4 text-sm text-muted-foreground">Klub bol založený v roku {club.founded_year}.</p>
            )}
          </motion.div>
        </section>
      )}

      {/* ---- GROUPS PREVIEW ---- */}
      {groups && groups.length > 0 && (
        <section className="bg-muted/40 py-16 md:py-24">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Tréningové skupiny</h2>
              <Link to={`${base}/skupiny`} className="text-primary text-sm flex items-center gap-1 hover:underline">
                Všetky skupiny <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {groups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" onClick={() => {}}>
                    <CardContent className="pt-6">
                      {group.icon_emoji && (
                        <div className="text-4xl mb-3">{group.icon_emoji}</div>
                      )}
                      <GroupBadge group={group.slug} emoji={null} className="mb-3" />
                      <h3 className="font-semibold text-lg mb-1">{group.display_name}</h3>
                      {group.age_from != null && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {group.age_from}{group.age_to ? `–${group.age_to}` : "+"} rokov
                        </p>
                      )}
                      {group.description_sk && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{group.description_sk}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link to={`${base}/rozvrh`}>
                  <Calendar className="mr-2 h-4 w-4" /> Zobraziť rozvrh tréningov
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ---- NEWS PREVIEW ---- */}
      {news && news.length > 0 && (
        <section className="container py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Novinky</h2>
            <Link to={`${base}/novinky`} className="text-primary text-sm flex items-center gap-1 hover:underline">
              Všetky novinky <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow overflow-hidden">
                {article.cover_image_url && (
                  <img src={article.cover_image_url} alt={article.title_sk} className="w-full h-40 object-cover" />
                )}
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(new Date(article.published_at), "d. MMMM yyyy", { locale: sk })}
                  </p>
                  <h3 className="font-semibold mb-2 line-clamp-2">{article.title_sk}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{article.body_sk}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ---- CTA BANNER ---- */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Zaujíma ťa plávanie?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Kontaktuj nás a dohodíme tréningový plán šitý na mieru.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to={`${base}/kontakt`}>Napíš nám</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
