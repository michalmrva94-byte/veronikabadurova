import { Navigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useClubContext } from "@/contexts/ClubContext"
import { Waves } from "lucide-react"
import type { ClubAdminRole } from "@/integrations/supabase/types"

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const { user, isLoading, getClubAdminRole } = useAuth()
  const { club, isLoading: clubLoading } = useClubContext()
  const [role, setRole] = useState<ClubAdminRole | null | undefined>(undefined)

  useEffect(() => {
    if (!user || !club) return
    getClubAdminRole(club.id).then(setRole)
  }, [user, club])

  if (isLoading || clubLoading || role === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Waves className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  if (!user) return <Navigate to={`/${slug}/prihlasenie`} replace />
  if (!role) return <Navigate to={`/${slug}/rodic`} replace />

  return <>{children}</>
}
