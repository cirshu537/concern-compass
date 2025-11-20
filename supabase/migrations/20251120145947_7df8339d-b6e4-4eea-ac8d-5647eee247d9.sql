-- Fix search_path security warnings for all notification functions
DROP FUNCTION IF EXISTS notify_staff_on_new_complaint() CASCADE;
CREATE OR REPLACE FUNCTION notify_staff_on_new_complaint()
RETURNS TRIGGER AS $$
DECLARE
  staff_record RECORD;
BEGIN
  -- Notify all staff in the branch for facility/campus issues
  IF NEW.category = 'facility_campus' OR NEW.category = 'personal_institute' OR 
     NEW.category = 'content_quality' OR NEW.category = 'platform_issue' OR 
     NEW.category = 'payment_membership' OR NEW.category = 'support_communication' OR 
     NEW.category = 'safety_wellbeing' THEN
    
    FOR staff_record IN 
      SELECT id FROM profiles 
      WHERE role = 'staff' AND branch = NEW.branch
    LOOP
      INSERT INTO notifications (user_id, text, data)
      VALUES (
        staff_record.id,
        'New concern submitted: ' || NEW.title,
        jsonb_build_object('complaint_id', NEW.id)
      );
    END LOOP;
  END IF;

  -- Notify trainers for trainer-related issues
  IF NEW.category = 'trainer_related' THEN
    FOR staff_record IN 
      SELECT id FROM profiles 
      WHERE role = 'trainer' AND branch = NEW.branch
    LOOP
      INSERT INTO notifications (user_id, text, data)
      VALUES (
        staff_record.id,
        'New trainer-related concern: ' || NEW.title,
        jsonb_build_object('complaint_id', NEW.id)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS notify_student_on_status_change() CASCADE;
CREATE OR REPLACE FUNCTION notify_student_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_text TEXT;
BEGIN
  -- Only notify on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'in_process' THEN status_text := 'Your concern is now being processed';
      WHEN 'fixed' THEN status_text := 'Your concern has been fixed';
      WHEN 'cancelled' THEN status_text := 'Your concern has been cancelled';
      WHEN 'rejected' THEN status_text := 'Your concern has been rejected';
      ELSE status_text := 'Your concern status has been updated';
    END CASE;

    INSERT INTO notifications (user_id, text, data)
    VALUES (
      NEW.student_id,
      status_text || ': ' || NEW.title,
      jsonb_build_object('complaint_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS notify_on_review() CASCADE;
CREATE OR REPLACE FUNCTION notify_on_review()
RETURNS TRIGGER AS $$
DECLARE
  complaint_record RECORD;
  reviewer_name TEXT;
BEGIN
  -- Get complaint details
  SELECT * INTO complaint_record FROM complaints WHERE id = NEW.complaint_id;
  
  -- Get reviewer name
  SELECT full_name INTO reviewer_name FROM profiles WHERE id = NEW.reviewer_id;

  -- Notify student when staff/trainer reviews them
  IF NEW.reviewer_role IN ('staff', 'trainer', 'branch_admin') THEN
    INSERT INTO notifications (user_id, text, data)
    VALUES (
      complaint_record.student_id,
      reviewer_name || ' has reviewed your concern: ' || complaint_record.title,
      jsonb_build_object('complaint_id', NEW.complaint_id, 'review_id', NEW.id)
    );
  END IF;

  -- Notify staff/trainer when student reviews them
  IF NEW.reviewer_role = 'student' AND complaint_record.assigned_staff_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, text, data)
    VALUES (
      complaint_record.assigned_staff_id,
      'Student has reviewed your work on: ' || complaint_record.title,
      jsonb_build_object('complaint_id', NEW.complaint_id, 'review_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
DROP TRIGGER IF EXISTS on_complaint_created ON complaints;
CREATE TRIGGER on_complaint_created
  AFTER INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_staff_on_new_complaint();

DROP TRIGGER IF EXISTS on_complaint_updated ON complaints;
CREATE TRIGGER on_complaint_updated
  AFTER UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_student_on_status_change();

DROP TRIGGER IF EXISTS on_review_created ON complaint_reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON complaint_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_review();