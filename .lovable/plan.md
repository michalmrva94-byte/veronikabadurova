

## Zmena

**Súbor:** `src/pages/client/DashboardPage.tsx`

Zmeniť layout tlačidiel v hero karte z `flex items-center gap-3` (horizontálne vedľa seba) na `flex flex-col gap-2` — tlačidlá sa zobrazia pod sebou na plnú šírku karty:

```typescript
<div className="mt-4 flex flex-col gap-2">
  <Button asChild size="sm" variant="outline" className="w-full justify-center">
    <Link to={ROUTES.MY_TRAININGS}>
      Moje tréningy
      <ArrowRight className="ml-1 h-4 w-4" />
    </Link>
  </Button>
  <Button size="sm" variant="ghost" className="w-full justify-center" onClick={handleAddToCalendar}>
    <CalendarPlus className="mr-1 h-4 w-4" />
    Pridať do kalendára
  </Button>
</div>
```

Tlačidlá budú vždy pod sebou, plná šírka, vycentrované — čisté a dotykovo priateľné.

