-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.complaint_reviews;

-- Create new restrictive policy for viewing reviews
CREATE POLICY "Only involved parties can view reviews" 
ON public.complaint_reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = complaint_reviews.complaint_id
    AND (
      -- Student who raised the complaint
      c.student_id = auth.uid()
      -- Staff assigned to the complaint
      OR c.assigned_staff_id = auth.uid()
      -- Trainer assigned to the complaint
      OR c.assigned_trainer_id = auth.uid()
      -- Branch admin or main admin
      OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('branch_admin', 'main_admin')
      )
    )
  )
);