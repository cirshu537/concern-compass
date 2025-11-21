-- Fix RLS policy for complaint_reviews to allow trainers to view reviews on trainer_related complaints

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Only involved parties can view reviews" ON complaint_reviews;

-- Create updated SELECT policy that includes trainers viewing trainer_related complaints
CREATE POLICY "Only involved parties can view reviews" ON complaint_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = complaint_reviews.complaint_id
    AND (
      c.student_id = auth.uid() OR
      c.assigned_staff_id = auth.uid() OR
      c.assigned_trainer_id = auth.uid() OR
      -- Allow trainers to view reviews on trainer_related complaints
      (c.category = 'trainer_related' AND EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.role = 'trainer'
      )) OR
      -- Allow admins to view all reviews
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() 
        AND p.role IN ('branch_admin', 'main_admin')
      )
    )
  )
);