

## Plan: Add cancellation fee support to admin cancelBooking

### Changes across 4 files

#### 1. `src/hooks/useAdminBookings.ts`
- Add optional `feePercentage` (default `0`) to the `cancelBooking` mutation input type: `{ bookingId: string; reason?: string; feePercentage?: number }`
- When `feePercentage > 0`, calculate `fee = booking.price * (feePercentage / 100)` and:
  - Call `apply_charge` RPC with `p_client_id`, `p_booking_id`, `p_charge_type: 'cancellation'`, `p_charge: fee`, `p_note` including the percentage
  - Set `cancellation_fee: fee` on the booking update
  - Include the fee amount in the notification message
- When `feePercentage === 0` (default), behavior stays exactly as today — no charge, no `cancellation_fee`

#### 2. `src/components/admin/ConfirmedBookingCard.tsx`
- Update `onCancel` prop type to `(bookingId: string, reason?: string, feePercentage?: number) => void`
- Replace the simple cancel AlertDialog with one that includes a fee percentage selector (radio group with 0%, 50%, 80%, 100% options, default 0%)
- Show a calculated fee preview: `booking.price * selectedPercentage / 100` €
- Pass the selected percentage through `onCancel`

#### 3. `src/components/admin/SlotDetailDialog.tsx`
- Update `onCancel` prop type to match: `(bookingId: string, reason?: string, feePercentage?: number) => void`
- Replace the inline cancel button with an AlertDialog containing the same fee percentage selector (radio group: 0%, 50%, 80%, 100%)
- Show fee preview and pass percentage through `onCancel`

#### 4. `src/pages/admin/AdminDashboardPage.tsx` and `src/pages/admin/AdminCalendarPage.tsx`
- Update `handleCancel` / `handleSlotCancel` to accept and forward `feePercentage`:
  - `handleCancel(bookingId, reason, feePercentage)` → `cancelBooking.mutateAsync({ bookingId, reason, feePercentage })`

### Technical detail

**Hook mutation change** (useAdminBookings.ts, inside `cancelBooking.mutationFn`):
```typescript
// After fetching booking, before updating status:
const feePercentage = params.feePercentage ?? 0;
const fee = feePercentage > 0 ? booking.price * (feePercentage / 100) : 0;

if (fee > 0) {
  const { error: chargeError } = await supabase.rpc('apply_charge', {
    p_client_id: booking.client_id,
    p_booking_id: bookingId,
    p_charge_type: 'cancellation',
    p_charge: fee,
    p_note: `Storno poplatok (${feePercentage}%)`,
  });
  if (chargeError) throw chargeError;
}

// Then in the booking update, add: cancellation_fee: fee
```

**UI selector** (RadioGroup with 4 options in the cancel AlertDialog):
```
○ 0% – Bez poplatku (0 €)
○ 50% – 12.50 €
○ 80% – 20.00 €
○ 100% – 25.00 €
```

No changes to `rejectBooking`. No changes to any other files.

