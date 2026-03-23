

## Vymazanie testovacieho storna

### Nájdené záznamy
- **Booking**: `fb82cb90-24da-4851-abff-a6a0a8b5ce81` — Veronika Baďurová, storno z 23.3.2026, tréning 26.3. o 9:00, poplatok 0€, žiadne transakcie
- **Notifikácia**: `c1be1b24-2c71-4f13-8039-ce6b4b56220b` — "Zmena termínu" spojená s daným slotom
- **Slot**: `02a3e2ea-fd41-4261-8f6a-ac05a800c5cb` — je to blokovaný slot (externý klient), ten ponecháme

### Zmeny (migrácia)
```sql
DELETE FROM notifications WHERE id = 'c1be1b24-2c71-4f13-8039-ce6b4b56220b';
DELETE FROM bookings WHERE id = 'fb82cb90-24da-4851-abff-a6a0a8b5ce81';
```

Toto odstráni testovací booking a súvisiacu notifikáciu. Slot zostane nedotknutý (je to blokovaný externý tréning). Žiadne transakcie neexistujú, takže financie nie sú ovplyvnené. Štatistika storna sa automaticky opraví — tento booking sa prestane počítať do metriky "Miera storna".

