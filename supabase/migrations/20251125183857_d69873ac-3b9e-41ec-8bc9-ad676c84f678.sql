-- Remove the RLS policy we added for branch admins
DROP POLICY IF EXISTS "Branch admins can view profiles in their branch" ON public.profiles;