

## Plán: Rozšírenie rozsahu na 4 týždne

### Zmena v `src/components/admin/ProposeFixedTrainingsDialog.tsx`

Riadky 168-170 – pridať jednu položku:

```tsx
<SelectItem value="1">Najbližší 1 týždeň</SelectItem>
<SelectItem value="2">Najbližšie 2 týždne</SelectItem>
<SelectItem value="4">Najbližšie 4 týždne (mesiac)</SelectItem>
```

Žiadne ďalšie zmeny nie sú potrebné – hook už dynamicky generuje dátumy podľa `weeksAhead`.

