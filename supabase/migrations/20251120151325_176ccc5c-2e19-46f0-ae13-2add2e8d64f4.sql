-- Drop and recreate the SELECT policy for complaint_reviews to ensure it works correctly
DROP POLICY IF EXISTS "Anyone can view reviews" ON complaint_reviews;

-- Create a proper policy that allows all authenticated users to view all reviews
CREATE POLICY "Anyone can view reviews"
ON complaint_reviews
FOR SELECT
TO authenticated
USING (true);
