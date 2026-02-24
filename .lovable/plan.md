

## Plan: Odosielanie kontaktného formulára emailom na veronika.duro@gmail.com

### Prehľad
Kontaktný formulár na landing page aktuálne len simuluje odoslanie. Vytvorím edge function, ktorá cez Resend odošle email s obsahom formulára na veronika.duro@gmail.com, a prepojím ju s formulárom.

### Zmeny

#### 1. Nová edge function: `supabase/functions/send-contact-form/index.ts`
- Prijme JSON body: `{ name, email, message }`
- Validuje vstupy (max dĺžky, povinné polia, email formát)
- Odošle email cez Resend na `veronika.duro@gmail.com` z `Veronika Swim <noreply@veronikaswim.sk>`
- Subject: `Nová správa z webu od {name}`
- HTML body: meno, email odosielateľa, text správy
- Reply-To header nastavený na email odosielateľa (aby Veronika mohla priamo odpovedať)
- CORS headers, OPTIONS handler
- `RESEND_API_KEY` secret je už nakonfigurovaný

#### 2. `supabase/config.toml`
- Pridať `[functions.send-contact-form]` s `verify_jwt = false` (verejný formulár, neprihlásení užívatelia)

#### 3. `src/components/landing/ContactSection.tsx`
- Nahradiť `await new Promise(r => setTimeout(r, 1000))` skutočným volaním `supabase.functions.invoke('send-contact-form', { body: { name, email, message } })`
- Pridať error handling: ak edge function vráti chybu, zobraziť `toast.error`
- Import `supabase` z `@/integrations/supabase/client`

### Bezpečnosť
- Vstupná validácia na klientovi (už existuje) aj na serveri (edge function)
- Rate limiting nie je v scope, ale maxLength na poliach chráni pred zneužitím
- Žiadne DB zmeny, žiadne RLS implikácie

