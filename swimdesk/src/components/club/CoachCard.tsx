import { Mail, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { GroupBadge } from "./GroupBadge"
import { DISCIPLINE_DISPLAY } from "@/lib/utils"
import type { Coach } from "@/integrations/supabase/types"

interface CoachCardProps {
  coach: Coach
}

export function CoachCard({ coach }: CoachCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {coach.photo_url ? (
        <img src={coach.photo_url} alt={coach.full_name} className="w-full h-56 object-cover object-top" />
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-swim-lane to-swim-water flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
            {coach.full_name.charAt(0)}
          </div>
        </div>
      )}
      <CardContent className="pt-4 pb-5">
        <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
          {coach.title ?? "Tréner"}
        </p>
        <h3 className="text-lg font-bold mb-3">{coach.full_name}</h3>

        {/* Groups */}
        {coach.groups && coach.groups.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {coach.groups.map((g) => (
              <GroupBadge key={g} group={g} />
            ))}
          </div>
        )}

        {/* Specialization */}
        {coach.specialization && coach.specialization.length > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            {coach.specialization.map((d) => DISCIPLINE_DISPLAY[d] ?? d).join(", ")}
          </p>
        )}

        {coach.bio_sk && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{coach.bio_sk}</p>
        )}

        {/* Contact */}
        <div className="flex flex-col gap-1 mt-auto">
          {coach.email && (
            <a href={`mailto:${coach.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-3.5 w-3.5" /> {coach.email}
            </a>
          )}
          {coach.phone && (
            <a href={`tel:${coach.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" /> {coach.phone}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
