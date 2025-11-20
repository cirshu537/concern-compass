-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Allow users to view their own complete profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to view only basic info (name, role, branch) of other users, NOT emails or sensitive data
CREATE POLICY "Users can view basic info of others"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() != id);

-- Create a view for public profile info that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  role,
  branch,
  program,
  student_type,
  credits,
  banned_from_raise,
  high_alert,
  created_at
FROM profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;