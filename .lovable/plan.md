

## Plan: Reset databázy pre produkčné používanie

### Aktuálny stav

**Profily (5):**
- Veronika Baďurová — admin (PONECHAŤ)
- Marianna Pliešovská — reálny klient (PONECHAŤ)
- alica — reálny klient (PONECHAŤ)
- Michal Mrva — testovací účet (ODSTRÁNIŤ)
- Miško — testovací účet (ODSTRÁNIŤ)

**Bookings (5):**
- alica: booked 25.2. 17:00 (PONECHAŤ)
- Marianna: awaiting_confirmation 26.2. 06:15 (PONECHAŤ)
- Miško: 3 bookings — booked, 2x cancelled (ODSTRÁNIŤ)

**Notifikácie (25):** Väčšina sú testovacie notifikácie pre Veroniku z testovacieho obdobia. Ponechať len tie pre reálnych klientov (alica: 1, Marianna: 1).

**Sloty (25):** Staré sloty z testovania pred dneškom, ktoré nemajú reálne bookings, budú odstránené. Budúce voľné sloty a sloty s reálnymi bookings zostanú.

**Transakcie:** 0 — čisté.
**Referral rewards:** 0 — čisté.

### Postup čistenia (v poradí kvôli foreign keys)

1. **Zmazať bookings testovacích klientov** (Miško — 3 bookings)
2. **Zmazať notifikácie testovacích klientov** (Miško: 1, Michal Mrva: 1)
3. **Zmazať testovacie notifikácie admina** (23 starých notifikácií pre Veroniku)
4. **Zmazať staré sloty** bez aktívnych bookings (pred dneškom + sloty Miška)
5. **Zmazať testovacích klientov** cez edge funkciu `delete-client` (Michal Mrva, Miško) — táto funkcia vymaže profil, roly aj auth účet

### Výsledok po čistení

- 3 profily: Veronika (admin), Marianna, alica
- 2 aktívne bookings: alica (dnes), Marianna (zajtra)
- 2 notifikácie: po jednej pre každého reálneho klienta
- Len relevantné budúce sloty v kalendári
- Dashboard bude ukazovať čerstvé, reálne dáta

### Implementácia

Toto je čisto dátová operácia — žiadne zmeny v kóde. Vykonám DELETE príkazy cez databázu v správnom poradí a potom zavolám edge funkciu na odstránenie testovacích auth účtov.

