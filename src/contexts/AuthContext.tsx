import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole, ClientApprovalStatus } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  approvalStatus: ClientApprovalStatus | null;
  isLoading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, referralCode?: string, trainingGoal?: string, preferredDays?: string, flexibilityNote?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  waitForRole: () => Promise<AppRole | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile and role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()
      ]);

      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
        throw profileResult.error;
      }
      
      setProfile(profileResult.data as Profile);

      if (roleResult.error) {
        console.error('Error fetching role:', roleResult.error);
        // Default to client if role fetch fails
        setRole('client');
      } else {
        const fetchedRole = roleResult.data?.role as AppRole || 'client';
        console.log('Fetched role:', fetchedRole);
        setRole(fetchedRole);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
      setRole('client');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid deadlock with Supabase
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string, trainingGoal?: string, preferredDays?: string, flexibilityNote?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            referral_code: referralCode,
            training_goal: trainingGoal,
            preferred_days: preferredDays,
            flexibility_note: flexibilityNote,
          },
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const waitForRole = async (): Promise<AppRole | null> => {
    // Ak už máme rolu, vrátiť ju okamžite
    if (role !== null) return role;
    
    // Ak máme user-a, priamo načítať rolu z databázy
    const currentSession = await supabase.auth.getSession();
    const currentUserId = currentSession.data.session?.user?.id;
    
    if (!currentUserId) return null;
    
    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUserId)
      .single();
    
    if (error || !roleData) {
      console.error('Error fetching role in waitForRole:', error);
      return 'client';
    }
    
    const fetchedRole = roleData.role as AppRole;
    setRole(fetchedRole);
    return fetchedRole;
  };

  const approvalStatus = (profile?.approval_status as ClientApprovalStatus) ?? null;

  const value = {
    user,
    session,
    profile,
    role,
    approvalStatus,
    isLoading,
    isAdmin: role === 'admin',
    isApproved: approvalStatus === 'approved' || role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshProfile,
    waitForRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
