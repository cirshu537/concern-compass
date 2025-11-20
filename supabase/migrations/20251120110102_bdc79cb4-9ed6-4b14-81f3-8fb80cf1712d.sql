-- Add RLS policies for credit_awards table
CREATE POLICY "Admins can view credit awards" ON public.credit_awards 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'branch_admin', 'main_admin')
    )
  );

CREATE POLICY "System can insert credit awards" ON public.credit_awards 
  FOR INSERT WITH CHECK (true);

-- Add RLS policies for negative_events table
CREATE POLICY "Users can view their own negative events" ON public.negative_events 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all negative events" ON public.negative_events 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'branch_admin', 'main_admin')
    )
  );

CREATE POLICY "System can insert negative events" ON public.negative_events 
  FOR INSERT WITH CHECK (true);

-- Fix the update_updated_at function to have a stable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;