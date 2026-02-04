
# Skrytý odkaz na admin prihlásenie

## Prehľad
Pridanie klikateľného odkazu na text "© 2024 Veronika Swim" vo footeri landing page, ktorý presmeruje na admin login stránku `/admin/prihlasenie`.

## Čo sa zmení

### Landing Page Footer
Text "© 2024 Veronika Swim" vo footeri sa stane klikateľným odkazom:
- Vzhľad zostane rovnaký (sivý, malý text)
- Pri hoveri sa text jemne zvýrazní
- Kliknutím sa otvorí admin login stránka

## Technické detaily

### Zmeny v `src/pages/LandingPage.tsx`

```text
Pred:
  <p className="text-xs text-muted-foreground mt-1 opacity-60">
    © 2024 Veronika Swim
  </p>

Po:
  <Link 
    to={ROUTES.ADMIN.LOGIN}
    className="text-xs text-muted-foreground mt-1 opacity-60 hover:opacity-100 transition-opacity"
  >
    © 2024 Veronika Swim
  </Link>
```

## Výsledok
- Veronika bude môcť jednoducho pristúpiť k admin panelu kliknutím na copyright text
- Bežní používatelia si tento odkaz nevšimnú (vyzerá ako obyčajný text)
- Žiadne vizuálne zmeny - text zostáva rovnaký, len je klikateľný
