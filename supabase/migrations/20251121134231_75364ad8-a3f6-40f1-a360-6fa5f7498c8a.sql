-- Allow exclusive handlers to update exclusive member complaints
CREATE POLICY "Exclusive handlers can update exclusive complaints"
ON complaints
FOR UPDATE
USING (
  student_type = 'exclusive' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.handles_exclusive = true
  )
);

-- Allow trainers to update complaints assigned to them
CREATE POLICY "Trainers can update their assigned complaints"
ON complaints
FOR UPDATE
USING (
  assigned_trainer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'trainer'
  )
);