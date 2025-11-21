-- Fix notifications table RLS to allow system inserts
-- The triggers need to be able to insert notifications for users

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Allow system/triggers to insert notifications
CREATE POLICY "System can insert notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure the notifications table has RLS enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;