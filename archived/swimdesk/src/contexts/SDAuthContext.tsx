import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SDProfile, Club, CoachRole } from '@/types/swimdesk';

interface SDAuthContextType {
  user: User | null;
  session: Session | null;
  profile: SDProfile | null;
  club: Club | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null; userId?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createClubAndProfile: (clubName: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>;
}

const SDAuthContext = createContext<SDAuthContextType | undefined>(undefined);

export function SDAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SDProfile | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('sd_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profileData) {
        setProfile(null);
        setClub(null);
        return;
      }

      setProfile(profileData as SDProfile);

      if (profileData.club_id) {
        const { data: clubData } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', profileData.club_id)
          .single();
        setClub(clubData as Club | null);
      }
    } catch (error) {
      console.error('Error fetching SD profile:', error);
      setProfile(null);
      setClub(null);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setTimeout(() => fetchProfile(currentSession.user.id), 0);
        } else {
          setProfile(null);
          setClub(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        fetchProfile(existing.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });
      return { error: error as Error | null, userId: data?.user?.id };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const createClubAndProfile = async (clubName: string, firstName: string, lastName: string) => {
    if (!user) return { error: new Error('Nie ste prihlásený') };

    try {
      // Create club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({ name: clubName })
        .select()
        .single();

      if (clubError) return { error: clubError as unknown as Error };

      // Create profile with admin role
      const { error: profileError } = await supabase
        .from('sd_profiles')
        .insert({
          user_id: user.id,
          club_id: clubData.id,
          role: 'admin' as CoachRole,
          first_name: firstName,
          last_name: lastName,
        });

      if (profileError) return { error: profileError as unknown as Error };

      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setClub(null);
  };

  return (
    <SDAuthContext.Provider value={{
      user,
      session,
      profile,
      club,
      isLoading,
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
      refreshProfile,
      createClubAndProfile,
    }}>
      {children}
    </SDAuthContext.Provider>
  );
}

export function useSDAuth() {
  const ctx = useContext(SDAuthContext);
  if (!ctx) throw new Error('useSDAuth must be used within SDAuthProvider');
  return ctx;
}
