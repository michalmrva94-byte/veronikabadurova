

## Problem

On `AdminClientDetailPage.tsx` line 168, the balance is calculated as:
```typescript
const balance = client.balance ?? 0;
```

This only reads the `balance` column (credit) and completely ignores `debt_balance`. The client has `balance = 0` and `debt_balance = 25`, so it shows `0€` instead of `-25€`.

The client's own Finances page correctly computes `netBalance = balance - debtBalance`, but the admin client detail does not.

## Fix

In `src/pages/admin/AdminClientDetailPage.tsx`, change line 168 from:
```typescript
const balance = client.balance ?? 0;
```
to:
```typescript
const creditBalance = client.balance ?? 0;
const debtBalance = (client as any).debt_balance ?? 0;
const balance = creditBalance - debtBalance;
```

This makes the "Zostatok" card show the net balance (e.g. `-25.00€` in red), consistent with the client-facing Finances page.

No database or backend changes needed — the `debt_balance` column is already fetched via `select('*')`.

