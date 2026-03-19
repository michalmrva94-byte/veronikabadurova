import { Link, useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentStatusBadge } from "./PaymentStatusBadge"
import { usePaymentStatus } from "@/hooks/usePaymentStatus"
import { Pencil, User } from "lucide-react"
import type { Swimmer } from "@/integrations/supabase/types"
import { GROUP_DISPLAY } from "@/lib/utils"

interface Props {
  swimmer: Swimmer
}

export function SwimmerCard({ swimmer }: Props) {
  const { slug } = useParams<{ slug: string }>()
  const { data: paymentStatus } = usePaymentStatus(swimmer.id)

  const group = swimmer.training_groups as { display_name: string; slug: string; color: string | null } | undefined

  return (
    <Card>
      <CardContent className="py-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{swimmer.full_name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {group && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: group.color ? `${group.color}20` : undefined, color: group.color ?? undefined }}
              >
                {group.display_name ?? GROUP_DISPLAY[group.slug]}
              </span>
            )}
            <PaymentStatusBadge row={paymentStatus} />
          </div>
        </div>
        <Link to={`/${slug}/rodic/deti?edit=${swimmer.id}`} className="text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
