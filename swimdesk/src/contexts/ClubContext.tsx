import { createContext, useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useClub } from "@/hooks/useClub"
import type { Club } from "@/integrations/supabase/types"

interface ClubContextValue {
  club: Club | null | undefined
  isLoading: boolean
  slug: string
}

const ClubContext = createContext<ClubContextValue | null>(null)

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const { slug = "" } = useParams<{ slug: string }>()
  const { data: club, isLoading } = useClub(slug)

  // Apply club branding as CSS custom properties
  useEffect(() => {
    if (club) {
      document.documentElement.style.setProperty("--club-primary", club.primary_color)
      document.documentElement.style.setProperty("--club-accent", club.accent_color)
      document.documentElement.style.setProperty("--primary", hexToHsl(club.primary_color))
    }
  }, [club])

  return (
    <ClubContext.Provider value={{ club, isLoading, slug }}>
      {children}
    </ClubContext.Provider>
  )
}

export function useClubContext() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error("useClubContext must be used within ClubProvider")
  return ctx
}

/** Rough hex → HSL string for Tailwind CSS variables */
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}
