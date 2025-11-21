-- Drop the old restrictive policy for trainers updating complaints
DROP POLICY IF EXISTS "Trainers can update their assigned complaints" ON complaints;

-- Create new policy that allows trainers to update trainer-related complaints in their branch
CREATE POLICY "Trainers can update trainer-related complaints in their branch"
ON complaints
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'trainer'
    AND profiles.branch = complaints.branch
    AND complaints.category = 'trainer_related'
  )
  OR
  (
    assigned_trainer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  )
);