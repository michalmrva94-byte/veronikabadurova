import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import type { ParentProfile, ClubAdminRole } from "@/integrations/supabase/types"

interface AuthContextType {
  user: User | null
  session: Session | null
  parentProfile: ParentProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  getClubAdminRole: (clubId: string) => Promise<ClubAdminRole | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchParentProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", userId)
        .single()
      if (error) {
        console.error("Error fetching parent profile:", error)
        setParentProfile(null)
      } else {
        setParentProfile(data as ParentProfile)
      }
    } catch (err) {
      console.error("fetchParentProfile failed:", err)
      setParentProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchParentProfile(user.id)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          setTimeout(() => fetchParentProfile(currentSession.user.id), 0)
        } else {
          setParentProfile(null)
        }

        setIsLoading(false)
      }
    )

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing)
      setUser(existing?.user ?? null)
      if (existing?.user) fetchParentProfile(existing.user.id)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error as Error | null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            app: "swimdesk",
          },
        },
      })
      return { error: error as Error | null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setParentProfile(null)
  }

  const getClubAdminRole = async (clubId: string): Promise<ClubAdminRole | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .rpc("club_admin_role", { _user_id: user.id, _club_id: clubId })
    if (error || !data) return null
    return data as ClubAdminRole
  }

  return (
    <AuthContext.Provider
      value={{ user, session, parentProfile, isLoading, signIn, signUp, signOut, refreshProfile, getClubAdminRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
