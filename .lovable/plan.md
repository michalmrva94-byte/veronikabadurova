

# Plan: Human tone mikrocopy -- sekcia DOMOV

## Prehlad

Uprava vsetkych textov na klientskom dashboarde a v ProposedTrainingsSection tak, aby komunikacia posobila ludsky, milo a prirodzene v style Veroniky. Ziadna logika sa nemeni, iba texty a drobne vizualne upravy.

---

## Zmeny v DashboardPage.tsx

### 1. Greeting (riadky 124-131)

**S treningom:**
- Stare: `"Teším sa na ďalší tréning."`
- Nove: `"Teším sa na náš najbližší tréning. 💙"`

**Bez treningu (ked nextBooking === null a proposedBookings === 0):**
- Stare: rovnaky text vzdy
- Nove: dynamicky podtext: ak `nextBooking || proposedBookings.length > 0` -> `"Teším sa na náš najbližší tréning. 💙"`, inak -> `"Kedy sa vidíme najbližšie? 😊"`

### 2. Hero blok -- Navrhnuty trening (riadok 141-142)

Zmeny su v ProposedTrainingsSection (vid nizsie).

### 3. Hero blok -- Potvrdeny trening (riadky 146-149)

- Stare nadpis: `"Najbližší tréning"`
- Nove: `"Najbližší tréning"` (ponechat)
- Pridat podtext pod nadpis: `"Už sa na vás teším."`

### 4. Hero blok -- Nic naplanované (riadky 174-185)

- Stare: `"Zatiaľ nemáte naplánovaný tréning."`
- Nove: `"Momentálne nemáme naplánovaný tréning."` + novy riadok `"Vyberte si termín, ktorý vám vyhovuje."`
- CTA: `"Rezervovať tréning"` (ponechat)

### 5. Primarne CTA (riadky 188-191)

- Odstranit -- je duplicitne. CTA uz je v hero bloku (scenar C) alebo nie je potrebne duplicitne ked ma trening.
- ALTERNATIVA: Ponechat iba ak `nextBooking` existuje (klient ma trening, ale moze chciet dalsi). Ak nema trening, CTA je uz v karte vyssie.

### 6. Moja aktivita (riadky 193-223)

- Stare nadpis: `"Moja aktivita"`
- Nove: `"Vaša aktivita"`
- Pridat motivacnu spravu pod metriky:
  - Ak `streak > 0`: `"Skvelá konzistentnosť."`
  - Ak `thisWeekCount === 0 && thisMonthCount === 0 && streak === 0`: `"Každý začiatok sa počíta. 💪"`

### 7. Zostatok (riadky 226-258)

- Mikrocopy zmeny:
  - Stare `netBalance > 0`: `"Máte dostupný kredit."`
  - Nove: `"Máte dostupný kredit na tréningy."`
  
  - Stare `netBalance === 0`: `"Momentálne nemáte kredit ani dlh."`
  - Nove: `"Momentálne nemáte kredit ani záväzok."`
  
  - Stare `netBalance < 0`: `"Evidujeme nezaplatený zostatok."`
  - Nove: `"Momentálne evidujem neuhradený tréning. Platbu si vyriešime pri najbližšom stretnutí."`

- Farba pri 0: zmenit border z `border-border` na `border-warning/20` (jemna oranzova namiesto sivej)

### 8. Posledne treningy -- statusy (riadky 260-299)

Zmeny su v getStatusBadge v ProposedTrainingsSection:
- `completed`: zmenit label z `"Dokončené"` na `"Prebehlo"`
- `booked`: zmenit label z `"Potvrdené"` -- ponechat, ale v historii sa nebude zobrazovat (booked je upcoming, nie past)

### 9. Rezervacne podmienky (riadky 302-316)

- Stare trigger text: `"Rezervačné podmienky"`
- Nove: `"Storno pravidlá (pre istotu 😊)"`
- Pridat kratky uvod pred percentualne pravidla:
  `"Ak sa niečo zmení, dajte mi vedieť čo najskôr. Spolu to vždy vyriešime."`

---

## Zmeny v ProposedTrainingsSection.tsx

### Hero alert box (riadky 128-145)

- Ikona: zmenit z `AlertTriangle` (varovanie) na nieco miernejsie -- pouzit `Clock` alebo ponechat ale zmenit farbu
- Stare text: `"Máte návrhy tréningov"`
- Nove: `"Navrhla som vám tréning ✨"` (ak 1) / `"Navrhla som vám tréningy ✨"` (ak viac)
- Stare podtext: `"X tréningov čaká na vašu odpoveď"`
- Nove: `"Dajte mi vedieť, či vám termín vyhovuje."` (ak 1) / `"Dajte mi vedieť, či vám termíny vyhovujú."` (ak viac)

### Tlacidla (riadky 148-176)

- `"Potvrdiť všetky"` -> `"Potvrdiť všetky termíny"`
- `"Zobraziť detaily"` -> `"Zobraziť termíny"`

### Reject tlacidlo v detaile (riadky 210-217)

- Zmenit tooltip/label z reject na "Navrhnúť iný čas" -- vizualne ponechat X ikonu ale zmenit hover farbu z `text-destructive` na `text-muted-foreground`

### getStatusBadge funkcia (riadky 37-63)

- `completed`: `"Dokončené"` -> `"Prebehlo"`
- Ostatne ponechat

---

## Subory na upravu

- `src/pages/client/DashboardPage.tsx`
- `src/components/client/ProposedTrainingsSection.tsx`

## Co sa NEMENI

- Ziadna logika, ziadne hooks, ziadna databaza
- PendingApprovalScreen, RejectedScreen (uz su v spravnom tone)
- Admin texty
- Layout, farby (okrem drobnych zmien pri zostatku 0 a reject buttone)
