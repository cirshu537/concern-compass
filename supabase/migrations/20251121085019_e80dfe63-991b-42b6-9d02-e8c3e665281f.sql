-- Add RLS policy for exclusive handlers to view exclusive member complaints
CREATE POLICY "Exclusive handlers can view exclusive member complaints"
ON public.complaints
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.handles_exclusive = true
    AND complaints.student_type = 'exclusive'
  )
);