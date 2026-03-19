import { Navigate, useParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Waves } from "lucide-react"

export function ProtectedParentRoute({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Waves className="h-8 w-8 text-primary animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/${slug}/prihlasenie`} replace />
  }

  return <>{children}</>
}
