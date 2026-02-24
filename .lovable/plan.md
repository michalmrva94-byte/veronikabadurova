

## Plan: Dynamic cancellation fee display in CancelBookingDialog

### Problem
The dialog shows fees based on hardcoded constants (0%, 50%, 80%) but the actual charge uses dynamic values from `app_settings`. If an admin changes the percentages, the user sees a wrong preview.

### Changes — single file: `src/components/client/CancelBookingDialog.tsx`

1. **Add a query** to fetch `cancel_fee_24h` and `cancel_fee_48h` from `app_settings` when the dialog is open (using `useQuery` with `enabled: isOpen`).

2. **Replace `getCancellationFee`** logic to use the fetched percentages instead of hardcoded 50/80 values. Fallback to the current hardcoded values if the fetch fails.

3. **Loading state**: While the query is loading, show a `Skeleton` placeholder (from `@/components/ui/skeleton`) in place of the fee amount text. The rest of the dialog UI (date, time, buttons) remains visible immediately.

### Technical detail

```typescript
// Inside the component, before the return:
const { data: feeSettings, isLoading: isLoadingFees } = useQuery({
  queryKey: ['cancel-fee-settings'],
  queryFn: async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['cancel_fee_24h', 'cancel_fee_48h']);
    const map: Record<string, number> = {};
    (data || []).forEach((s: any) => { map[s.key] = parseFloat(s.value) || 0; });
    return { fee24h: map['cancel_fee_24h'] ?? 80, fee48h: map['cancel_fee_48h'] ?? 50 };
  },
  enabled: isOpen,
  staleTime: 60_000,
});

// Fee calculation using dynamic values:
const fee24h = feeSettings?.fee24h ?? 80;
const fee48h = feeSettings?.fee48h ?? 50;
// Then apply same time-based logic with these values
```

The confirm button will be disabled while fees are loading to prevent confirming with unknown fee.

No other files are changed.

