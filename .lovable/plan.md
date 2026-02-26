

## Zmena

Pridať tlačidlo "Pridať do kalendára" do hero karty "Najbližší tréning" na klientskom dashboarde — vedľa existujúceho tlačidla "Moje tréningy".

### Implementácia v `src/pages/client/DashboardPage.tsx`

1. Pridať import `CalendarPlus` z `lucide-react` (riadok 8)
2. Pridať import `toast` z `sonner`
3. Vytvoriť helper funkciu `handleAddToCalendar` (rovnaká logika ako v `BookingCard.tsx`) — generuje .ics súbor pre `nextBooking`
4. Do sekcie "B) Potvrdený tréning" (riadky 159-165) pridať druhé tlačidlo:

```typescript
<div className="mt-4 flex items-center gap-3">
  <Button asChild size="sm" variant="outline">
    <Link to={ROUTES.MY_TRAININGS}>
      Moje tréningy
      <ArrowRight className="ml-1 h-4 w-4" />
    </Link>
  </Button>
  <Button size="sm" variant="ghost" onClick={handleAddToCalendar}>
    <CalendarPlus className="mr-1 h-4 w-4" />
    Pridať do kalendára
  </Button>
</div>
```

Funkcia `handleAddToCalendar` bude definovaná v `ApprovedDashboard` komponente a vygeneruje .ics súbor s údajmi z `nextBooking`.

