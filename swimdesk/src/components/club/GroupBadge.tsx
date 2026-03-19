import { cn } from "@/lib/utils"
import type { SwimmerGroup } from "@/integrations/supabase/types"
import { GROUP_COLORS, GROUP_DISPLAY } from "@/lib/utils"

interface GroupBadgeProps {
  group: SwimmerGroup
  emoji?: string | null
  className?: string
}

export function GroupBadge({ group, emoji, className }: GroupBadgeProps) {
  const color = GROUP_COLORS[group] ?? "#0EA5E9"
  const label = GROUP_DISPLAY[group] ?? group

  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white", className)}
      style={{ backgroundColor: color }}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  )
}
