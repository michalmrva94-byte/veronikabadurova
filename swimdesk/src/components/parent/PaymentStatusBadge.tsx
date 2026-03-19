import { cn } from "@/lib/utils"
import type { PaysyMemberStatus } from "@/integrations/supabase/types"
import { effectiveStatus } from "@/hooks/usePaymentStatus"

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-green-100 text-green-800 border-green-200",
  pending:  "bg-yellow-100 text-yellow-800 border-yellow-200",
  expired:  "bg-red-100 text-red-800 border-red-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
}

const STATUS_LABELS: Record<string, string> = {
  active:   "Aktívny",
  pending:  "Čakajúci",
  expired:  "Vypršaný",
  inactive: "Neaktívny",
}

interface Props {
  row: PaysyMemberStatus | null | undefined
  className?: string
}

export function PaymentStatusBadge({ row, className }: Props) {
  const status = effectiveStatus(row)
  if (!status) return null

  const style = STATUS_STYLES[status] ?? STATUS_STYLES.inactive
  const label = STATUS_LABELS[status] ?? status
  const isOverride = !!row?.override_status

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        style,
        className
      )}
      title={isOverride && row?.override_note ? `Korekcia: ${row.override_note}` : undefined}
    >
      {label}
      {isOverride && <span className="opacity-70">*</span>}
    </span>
  )
}
