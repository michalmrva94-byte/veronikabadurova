

## Plan: Zobraziť poznámku v admin detaile termínu

### Prehľad
Pridanie zobrazenia `slot.notes` do `SlotDetailDialog.tsx` — admin uvidí poznámku (napr. "HipCentrum") po kliknutí na slot v kalendári.

### Zmena

**`src/components/admin/SlotDetailDialog.tsx`** — 1 zmena:
- Za riadok s časom (riadok 91-92) a pred sekciu "Client info" (riadok 94) pridať podmienený blok:
```tsx
{slot.notes && (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
    <span>📍</span>
    <span>{slot.notes}</span>
  </div>
)}
```

Žiadne ďalšie zmeny. Pole `notes` je už súčasťou `SlotWithBooking` typu a načítava sa v existujúcich queries.

