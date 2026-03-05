
1) DevTools console output during test booking
- Available console snapshot from your preview: **no logs recorded**.
- Session replay for this request contains only cursor moves, **no booking interaction events**.
- Therefore I cannot show runtime booking debug output from this capture (including `useBookings.ts` log), because no booking attempt was captured at message time.

2) Backend function logs (`send-push-notification`) — last 30 minutes
- Edge function analytics (HTTP invocation logs, last 30 min): **0 entries**.
- Runtime logs currently available:
  - `booted`
  - `Listening on http://localhost:9999/`
  - `shutdown`
- Conclusion: in the inspected window, the function was **not invoked** by booking flow.

3) Exact `useBookings.ts` block where push is called
```ts
// Send push notification to admins
if (adminIds && adminIds.length > 0) {
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('user_id')
    .in('id', adminIds);

  const adminUserIds = adminProfiles?.map(a => a.user_id).filter(Boolean) || [];
  if (adminUserIds.length > 0) {
    const name = clientProfile?.full_name || 'Klient';
    console.log('Sending push to admin user_ids:', adminUserIds);
    sendPushNotification({
      user_ids: adminUserIds,
      title: 'Nová požiadavka na tréning 📩',
      body: `${name} žiada o tréning`,
      url: '/admin/kalendar',
    });
  }
}
```

4) Does booking flow reach push code?
- Push logic is in `createBooking` mutation **`onSuccess`** callback.
- Inside `onSuccess`, push is in a **`try { ... } catch { ... }`** block.
- It is **not** inside a catch block, but failures before push (or empty `adminUserIds`) prevent the call.
- Important: `sendPushNotification(...)` is called **without `await`**, and that helper also catches errors internally, so failures can be quiet.

5) Confirm Veronika `510001b2...` is passed
- Admin mapping from backend data:
  - Michal: `1caa5cf6-ec51-4f8b-8450-5ad6270e56a8`
  - Veronika: `510001b2-a941-4c46-8def-df621c56ae9d`
- So the target array should include Veronika’s auth UUID **if `adminProfiles` is populated**.
- Critical finding: this lookup is done from client code via:
  - `.from('profiles').select('user_id').in('id', adminIds)`
- Your RLS on `profiles` allows clients to read only their own profile, not admin profiles.  
  Result: for client-triggered booking, this query likely returns empty array, so:
  - no `console.log('Sending push...')`
  - no function call
  - no edge logs

Additional data check from current DB snapshot
- `push_subscriptions` currently shows:
  - `1caa5cf6-...` (Michal, admin)
  - `ef733181-...` (client)
- I did **not** see a record for `510001b2-...` in the latest query snapshot.
