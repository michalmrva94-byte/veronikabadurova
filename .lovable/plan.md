

## Fix: Badge "2 <6h" pretekajúci mimo kartu

### Problém
V KPICard header riadku sú ikona + title + tooltip + badge v jednom `flex justify-between` riadku. Pri karte "Nepotvrdené" je title dlhý a badge sa vytláča mimo kartu.

### Riešenie
Presunúť badge z header riadku vedľa hlavnej hodnoty (mainValue), kde je dostatok miesta. Badge sa zobrazí napravo od čísla "3" na tom istom riadku.

### Zmena v `src/components/admin/KPICard.tsx`

- **Odstrániť** badge z header sekcie (riadky 94-98)
- **Pridať** badge vedľa `mainValue` na riadku 105-109, za hodnotu alebo trend arrow:

```tsx
<div className="flex items-baseline gap-2">
  <p className={`text-2xl font-bold tabular-nums ${colorMap[mainColor] || ''}`}>
    {mainValue}
  </p>
  {trend && <TrendArrow current={trend.current} previous={trend.previous} />}
  {badge && (
    <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0.5">
      {badge.label}
    </Badge>
  )}
</div>
```

Toto zabezpečí, že badge bude vždy vnútri karty, zarovnaný vedľa hlavného čísla.

