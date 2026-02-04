
# Oprava Admin Prihlásenia a Zobrazenia Klientov

## Identifikované problémy

### 1. Admin presmerovanie nefunguje (Race Condition)
Keď sa admin prihlási cez `/admin/prihlasenie`:
1. `signIn()` sa dokončí úspešne
2. Okamžite sa zavolá `navigate(ROUTES.ADMIN.DASHBOARD)`
3. **ALE** rola sa načítava asynchrónne a ešte nie je dostupná
4. `ProtectedRoute` vidí `role === null` alebo `isAdmin === false`
5. Presmeruje používateľa na `/prehlad` (klientský dashboard)

### 2. Zoznam klientov je prázdny
Stránka `AdminClientsPage` má hardcoded prázdne pole:
```typescript
const clients: any[] = [];
```
Klienti sa vôbec nenačítavajú z databázy!

---

## Riešenie

### Časť 1: Oprava Admin Login Flow

**Zmeny v `AdminLoginPage.tsx`:**
- Po úspešnom prihlásení **počkať na načítanie role** pred navigáciou
- Skontrolovať, či je používateľ admin, a až potom presmerovať
- Ak nie je admin, zobraziť chybovú hlášku

**Zmeny v `AuthContext.tsx`:**
- Pridať funkciu `waitForRole()` ktorá vráti Promise s rolou
- Umožniť čakanie na asynchrónne načítanie role

### Časť 2: Načítanie klientov z databázy

**Nový hook `useClients.ts`:**
- Vytvorenie React Query hooku pre načítanie klientov
- Spojenie tabuliek `profiles` a `user_roles` 
- Filtrovanie len klientov (role = 'client')

**Zmeny v `AdminClientsPage.tsx`:**
- Nahradenie hardcoded poľa reálnymi dátami z hooku
- Pridanie loading a error stavov
- Implementácia vyhľadávania

---

## Technické detaily

### 1. AuthContext - Nová funkcia na čakanie role

```typescript
// Pridať do AuthContext
const waitForRole = async (): Promise<AppRole | null> => {
  // Ak už máme rolu, vrátiť ju
  if (role !== null) return role;
  
  // Počkať max 5 sekúnd na načítanie role
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (role !== null) {
        clearInterval(checkInterval);
        resolve(role);
      }
    }, 100);
    
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(role);
    }, 5000);
  });
};
```

### 2. AdminLoginPage - Čakanie na rolu

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const { error } = await signIn(email, password);
  
  if (error) {
    // ... existujúce spracovanie chyby
    return;
  }

  // Počkať na načítanie role
  const userRole = await waitForRole();
  
  if (userRole !== 'admin') {
    await signOut();
    toast({
      variant: 'destructive',
      title: 'Prístup zamietnutý',
      description: 'Tento účet nemá admin oprávnenia.',
    });
    setIsLoading(false);
    return;
  }

  toast({
    title: 'Vitaj späť, Veronika!',
    description: 'Úspešne si sa prihlásila do admin panelu.',
  });

  navigate(ROUTES.ADMIN.DASHBOARD);
};
```

### 3. Nový hook useClients.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export interface ClientWithRole extends Profile {
  role: string;
}

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
```

### 4. AdminClientsPage - S reálnymi dátami

```typescript
export default function AdminClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: clients = [], isLoading, error } = useClients();

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ... render s loading, error a data stavmi
}
```

---

## Súbory na zmenu

| Súbor | Zmena |
|-------|-------|
| `src/contexts/AuthContext.tsx` | Pridať `waitForRole()` funkciu |
| `src/pages/admin/AdminLoginPage.tsx` | Čakať na rolu pred navigáciou |
| `src/hooks/useClients.ts` | **NOVÝ** - hook na načítanie klientov |
| `src/pages/admin/AdminClientsPage.tsx` | Použiť hook a zobraziť reálne dáta |

---

## Výsledok

Po implementácii:
1. Admin sa prihlási → systém počká na overenie role → presmeruje na `/admin`
2. Ak nie je admin → zobrazí sa chyba a odhlási sa
3. V admin dashboarde sa zobrazia reálni klienti z databázy
4. Vyhľadávanie bude fungovať na meno a email
