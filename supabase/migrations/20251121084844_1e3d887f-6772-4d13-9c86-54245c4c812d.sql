-- Add column to identify exclusive handlers
ALTER TABLE public.profiles 
ADD COLUMN handles_exclusive BOOLEAN NOT NULL DEFAULT false;

-- Update trigger to notify exclusive handlers for all exclusive member concerns
CREATE OR REPLACE FUNCTION public.notify_exclusive_handler_on_new_complaint()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  handler_record RECORD;
BEGIN
  -- Notify exclusive handlers for any exclusive member concerns
  IF NEW.student_type = 'exclusive' THEN
    FOR handler_record IN 
      SELECT id FROM profiles 
      WHERE handles_exclusive = true
    LOOP
      INSERT INTO notifications (user_id, text, data)
      VALUES (
        handler_record.id,
        'New Exclusive Member concern: ' || NEW.title,
        jsonb_build_object('complaint_id', NEW.id, 'category', NEW.category)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for exclusive handler notifications
CREATE TRIGGER notify_exclusive_handler_trigger
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_exclusive_handler_on_new_complaint();