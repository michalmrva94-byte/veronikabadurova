import { motion } from "framer-motion"
import { useClubContext } from "@/contexts/ClubContext"
import { useTrainingGroups } from "@/hooks/useTrainingGroups"
import { GroupBadge } from "@/components/club/GroupBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Waves } from "lucide-react"

export default function GroupsPage() {
  const { club } = useClubContext()
  const { data: groups, isLoading } = useTrainingGroups(club?.id)

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Tréningové skupiny</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Od prvých krokov vo vode až po vrcholových plavcov — máme skupinu pre každého.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Waves className="h-8 w-8 text-primary animate-pulse" />
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: group.color ?? "#0EA5E9" }}
                />
                <CardContent className="pt-6 pb-8">
                  <div className="flex items-start gap-4">
                    {group.icon_emoji && (
                      <span className="text-5xl">{group.icon_emoji}</span>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-2xl font-bold">{group.display_name}</h2>
                        <GroupBadge group={group.slug} />
                      </div>
                      {group.age_from != null && (
                        <p className="text-sm text-muted-foreground font-medium mb-3">
                          Vek: {group.age_from}{group.age_to ? `–${group.age_to}` : "+"} rokov
                        </p>
                      )}
                      {group.description_sk && (
                        <p className="text-muted-foreground leading-relaxed">{group.description_sk}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
