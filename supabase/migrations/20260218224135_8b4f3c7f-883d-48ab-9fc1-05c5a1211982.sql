-- Allow authenticated users to insert notifications (needed for client->admin notifications)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);