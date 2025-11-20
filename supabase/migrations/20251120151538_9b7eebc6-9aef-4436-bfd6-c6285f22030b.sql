-- Drop the view that's causing the security definer warning
DROP VIEW IF EXISTS public.public_profiles;

-- Keep the two RLS policies that were already created:
-- 1. "Users can view their own profile" - allows full access to own profile
-- 2. "Users can view basic info of others" - allows access to other profiles
-- 
-- Note: Column-level restrictions should be handled in application code by 
-- selectively querying only non-sensitive columns when fetching other users' data