

## Plan: Admin – manuálne odstránenie profilu klienta (2-krokový flow)

Snímka obrazovky slúži ako referencia pre umiestnenie funkcie v zozname klientov.

### Ako to bude fungovať

1. **Krok 1 – Tlačidlo "Odstrániť klienta"** na stránke detailu klienta (`AdminClientDetailPage`). Admin klikne na červené tlačidlo dole na stránke.
2. **Krok 2 – Potvrdenie cez AlertDialog** s textom "Naozaj chcete natrvalo odstrániť tohto klienta? Táto akcia je nevratná." Admin musí potvrdiť akciu.

Po potvrdení sa vykoná:
- Zmazanie všetkých záznamov klienta z tabuliek: `notifications`, `transactions`, `bookings`, `referral_rewards`, `profiles`, `user_roles`
- Zmazanie auth používateľa cez edge function (Supabase Admin API – `auth.admin.deleteUser`)
- Presmerovanie späť na zoznam klientov s toast notifikáciou

### Technické zmeny

#### 1. Nová edge function: `supabase/functions/delete-client/index.ts`
- Prijme `{ clientId: string }` (profile ID)
- Overí, že volajúci je admin (cez JWT + `has_role`)
- Získa `user_id` z profilu
- Zmaže v poradí: `notifications`, `transactions`, `bookings`, `referral_rewards`, `profiles`, `user_roles` (WHERE user_id / client_id)
- Zavolá `supabase.auth.admin.deleteUser(user_id)` na zmazanie auth záznamu
- Vráti `{ success: true }`

#### 2. Úprava: `src/pages/admin/AdminClientDetailPage.tsx`
- Pridať import `AlertDialog` komponentov a `Trash2` ikonu
- Pridať state: `deleteDialogOpen`
- Pridať `handleDeleteClient` funkciu – volá edge function `delete-client`, po úspechu invaliduje queries a naviguje na `/admin/klienti`
- Pridať AlertDialog s 2-krokovým potvrdením (tlačidlo → dialog → potvrdenie)
- Červené tlačidlo "Odstrániť klienta" umiestnené na konci stránky

#### 3. Žiadne DB migrácie
- Všetky tabuľky už majú admin ALL/DELETE politiky alebo cascade vzťahy. Edge function použije service role key, takže RLS nie je blocker.

### Bezpečnostné aspekty
- Edge function overuje admin rolu na serveri
- Použije `SUPABASE_SERVICE_ROLE_KEY` pre auth admin operácie
- Klient nemôže zavolať túto funkciu – JWT validácia + role check

