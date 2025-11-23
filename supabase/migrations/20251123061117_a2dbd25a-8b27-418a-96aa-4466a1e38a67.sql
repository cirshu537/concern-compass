-- Allow branch admins and main admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('branch_admin', 'main_admin')
    AND (
      p.role = 'main_admin'
      OR (p.role = 'branch_admin' AND p.branch = profiles.branch)
    )
  )
);