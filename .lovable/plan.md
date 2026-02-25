

## Plán: Ovládanie automatických emailov v admin nastaveniach

### Prehľad
Pridať novú kartu do stránky Nastavenia so Switch prepínačmi pre každý typ automatického emailu. Admin bude môcť individuálne zapnúť/vypnúť:

1. **Potvrdenie tréningu** (confirmation)
2. **Pripomienka tréningu** (reminder)
3. **Last-minute ponuka** (last_minute)
4. **Návrh tréningu** (proposal)
5. **Oznámenie o zrušení** (cancellation)

### Technický plán

**1. Databáza — `app_settings`**
Uložiť nový záznam s kľúčom `email_toggles` obsahujúcim JSON objekt:
```json
{
  "confirmation": true,
  "reminder": true,
  "last_minute": true,
  "proposal": true,
  "cancellation": true
}
```
Všetky typy budú predvolene zapnuté. Žiadna migrácia schémy nie je potrebná — tabuľka `app_settings` už existuje, stačí upsert dát.

**2. UI — `AdminSettingsPage.tsx`**
- Pridať nový stav `emailToggles` s defaultnými hodnotami (všetky `true`)
- Načítať z DB pri `fetchSettings` spolu s ostatnými nastaveniami
- Nová karta s ikonou `Mail` a 5 riadkami, každý so Switch prepínačom
- Každý riadok bude mať názov emailu a krátky popis kedy sa odosiela
- Uloženie cez existujúcu funkciu `handleSave` pridaním upsert pre `email_toggles`

**3. Logika odosielania — `sendNotificationEmail.ts`**
- Pred odoslaním emailu funkcia načíta `email_toggles` z `app_settings`
- Ak je daný typ vypnutý, email sa neodošle (silent skip)
- Toto zabezpečí centrálnu kontrolu bez nutnosti meniť každý hook zvlášť

### UI náhľad karty

```text
┌─────────────────────────────────────────┐
│ ✉ Automatické emaily                    │
│ Zapnite/vypnite jednotlivé typy emailov │
├─────────────────────────────────────────┤
│ Potvrdenie tréningu          [====ON]   │
│ Keď admin potvrdí rezerváciu             │
│                                          │
│ Pripomienka tréningu         [====ON]   │
│ 24h pred tréningom                       │
│                                          │
│ Last-minute ponuka           [====ON]   │
│ Pri zrušení / voľnom termíne            │
│                                          │
│ Návrh tréningu               [====ON]   │
│ Keď admin navrhne termín klientovi      │
│                                          │
│ Oznámenie o zrušení          [====ON]   │
│ Pri stornovaní tréningu                  │
└─────────────────────────────────────────┘
```

### Zmenené súbory
- `src/pages/admin/AdminSettingsPage.tsx` — nová karta + stav + ukladanie
- `src/lib/sendNotificationEmail.ts` — kontrola toggle pred odoslaním

