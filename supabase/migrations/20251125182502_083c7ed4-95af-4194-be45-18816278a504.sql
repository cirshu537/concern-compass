-- Add RLS policy for branch admins to view profiles in their branch
CREATE POLICY "Branch admins can view profiles in their branch"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'branch_admin'
    AND p.branch = profiles.branch
  )
);