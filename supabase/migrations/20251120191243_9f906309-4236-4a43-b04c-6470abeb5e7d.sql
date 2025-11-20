-- Update the handle_new_user function to include branch and program
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, student_type, branch, program)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'),
    COALESCE((NEW.raw_user_meta_data->>'student_type')::student_type, 'none'),
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'program'
  );
  RETURN NEW;
END;
$$;