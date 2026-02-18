
# Admin Kalendar - Mobile-Friendly Redizajn

Aktualny problem: Tyzdenny kalendar pouziva 7-stlpcovy grid (`grid-cols-7`) aj na mobile, co sposobuje, ze stlpce su prilis uzke, text je orezany a tlacidla "Pridat" su nefunkcne.

---

## Riesenie

Namiesto 7-stlpcoveho gridu na mobile sa prepne na **vertikalny zoznam dni** (stacked layout), kde kazdy den je kompaktny riadok s horizontalne zobrazenymi slotmi.

### Zmeny v `src/components/admin/WeeklyCalendarGrid.tsx`

1. **Responsivny layout**:
   - Mobile (< 768px): vertikalny zoznam dni, kazdy den ako riadok s horizontalnymi slot chipmi
   - Desktop (>= 768px): zachovat existujuci 7-stlpcovy grid

2. **Mobilna verzia - struktura kazdeho dna**:
   - Hlavicka: den + datum na jednom riadku (napr. "Po 16" alebo "Dnes - St 18")
   - Sloty: horizontalne chipove tlacidla s casom a menom klienta
   - Tlacidlo "+" na pridanie slotu - male, inline
   - Dni bez slotov budu kompaktnejsie

3. **Detekcia mobile**: pouzit existujuci hook `useIsMobile()` z `src/hooks/use-mobile.tsx`

4. **Legenda**: na mobile zobrazit v 2 riadkoch namiesto jedneho

### Zmeny v `src/pages/admin/AdminCalendarPage.tsx`

5. **Akcie v headeri**: na mobile zobrazit tlacidla pod nadpisom namiesto vedla neho (uz je `flex-wrap`, len overit spravanie)

---

## Technicky prehlad

### WeeklyCalendarGrid.tsx - mobilna cast

```text
Po 16        [06:00 Jana] [07:00 Peter] [+]
Ut 17        Ziadne treningy
St 18 (dnes) [06:00 voln.] [07:00 Eva]  [+]
St 19        [06:00 voln.]              [+]
...
```

- Kazdy slot chip bude mat farbu podla statusu (rovnaky `getSlotColor`)
- Kliknutie na chip otvori `SlotDetailDialog` (rovnake spravanie)
- Prazdne dni zobrazia sedy text "Ziadne treningy" a tlacidlo [+]

### Subory na upravu
- `src/components/admin/WeeklyCalendarGrid.tsx` - hlavna zmena, pridanie mobilneho layoutu
