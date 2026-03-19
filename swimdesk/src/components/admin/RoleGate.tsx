import { useEffect, useState, ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useClubContext } from "@/contexts/ClubContext"
import type { ClubAdminRole } from "@/integrations/supabase/types"

const ROLE_LEVELS: Record<ClubAdminRole, number> = {
  editor: 1,
  admin: 2,
  owner: 3,
}

interface RoleGateProps {
  minRole: ClubAdminRole
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ minRole, children, fallback = null }: RoleGateProps) {
  const { user, getClubAdminRole } = useAuth()
  const { club } = useClubContext()
  const [role, setRole] = useState<ClubAdminRole | null>(null)

  useEffect(() => {
    if (!user || !club) return
    getClubAdminRole(club.id).then((r) => setRole(r))
  }, [user, club])

  if (!role) return <>{fallback}</>

  const hasAccess = ROLE_LEVELS[role] >= ROLE_LEVELS[minRole]
  return hasAccess ? <>{children}</> : <>{fallback}</>
}
