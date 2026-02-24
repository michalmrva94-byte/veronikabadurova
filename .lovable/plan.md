

## Plan: Dynamic no-show fee percentage from app_settings

### What changes
In `src/hooks/useCompleteTraining.ts`, the `markNoShow` mutation will be updated to:

1. **Fetch the no-show fee percentage** from `app_settings` table using key `cancel_fee_noshow` (matching the existing settings pattern from `AdminSettingsPage`)
2. **Calculate the actual fee**: `price * (percentage / 100)`, defaulting to 100% if the setting is missing
3. **Use the calculated fee** in the booking update (`cancellation_fee`) and `apply_charge` RPC call (`p_charge`), and in the notification message

### Technical details

In the `markNoShow` `mutationFn`, before the booking update (line 70), insert a fetch to `app_settings`:

```typescript
// Fetch no-show fee percentage from settings
const { data: settings } = await supabase
  .from('app_settings')
  .select('value')
  .eq('key', 'cancel_fee_noshow')
  .single();

const noShowPercentage = settings ? parseFloat(settings.value) || 100 : 100;
const noShowFee = price * (noShowPercentage / 100);
```

Then replace all references to `price` in the rest of `markNoShow` with `noShowFee`:
- Line 72: `cancellation_fee: noShowFee`
- Line 81: `p_charge: noShowFee`
- Line 82: `p_note: \`Neúčasť na tréningu (${noShowPercentage}% poplatok)\``
- Line 90: `message: \`Tréning nebol absolvovaný. Podľa podmienok sa účtuje ${noShowFee.toFixed(2)} €.\``

No other changes to the file.

