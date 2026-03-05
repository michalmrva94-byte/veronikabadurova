

## Problem

When a client goes into debt (-25€) from a training and then pays (+25€ deposit), the system only increases `balance` but does **not** reduce `debt_balance`. Result: balance=25, debt_balance=25, netBalance=0 — but the debt still shows in "Klienti s dlhom".

The comment in `useAddCredit.ts` line 32 explicitly says "do NOT auto-pay debt", which is the root cause.

## Fix

Modify `useAddCredit.ts` to **automatically offset debt when credit is added**:

1. Fetch both `balance` and `debt_balance` from the client profile
2. After adding the deposit to balance, if client has debt AND has positive balance, use the balance to pay off debt:
   - `debtReduction = min(newBalance, currentDebt)`
   - `finalBalance = newBalance - debtReduction`
   - `finalDebt = currentDebt - debtReduction`
3. Update both `balance` and `debt_balance` in one update call
4. Record the deposit transaction as before (balance_after reflects final balance)

**Also fix Sona's current data**: Use the insert tool to set Sona Rebrová's `debt_balance` to 0 (since she already paid). Her balance should also be corrected to 0 (25 credit - 25 debt = 0 net).

### Files to change
1. `src/hooks/useAddCredit.ts` — add auto-debt-offset logic
2. Database data fix for Sona Rebrová via insert tool

