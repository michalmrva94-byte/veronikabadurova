import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // Najprv získať všetky user_id s rolou 'client'
      const { data: clientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      if (rolesError) throw rolesError;
      
      const clientUserIds = clientRoles.map(r => r.user_id);
      
      if (clientUserIds.length === 0) return [];

      // Potom získať profily týchto používateľov
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', clientUserIds)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      return profiles as Profile[];
    },
    staleTime: 60000, // 1 minúta
  });
}
