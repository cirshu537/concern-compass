-- Update handle_review_submission function to remove auto-negative for cancelled complaints
CREATE OR REPLACE FUNCTION public.handle_review_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_complaint complaints%ROWTYPE;
  v_student_profile profiles%ROWTYPE;
  v_staff_profile profiles%ROWTYPE;
  v_staff_negatives_this_week INT;
BEGIN
  -- Get complaint details
  SELECT * INTO v_complaint FROM complaints WHERE id = NEW.complaint_id;
  
  -- Get student profile
  SELECT * INTO v_student_profile FROM profiles WHERE id = v_complaint.student_id;
  
  -- Handle positive rating (+20 credits for both student and staff/trainer)
  IF NEW.rating = 1 THEN
    -- Award credits to student if not already awarded
    IF NOT EXISTS (
      SELECT 1 FROM credit_awards 
      WHERE complaint_id = NEW.complaint_id AND role = 'student'
    ) THEN
      INSERT INTO credit_awards (complaint_id, role, awarded)
      VALUES (NEW.complaint_id, 'student', true);
      
      UPDATE profiles 
      SET credits = credits + 20 
      WHERE id = v_complaint.student_id;
    END IF;
    
    -- Award credits to reviewer (staff/trainer) if not already awarded
    IF NOT EXISTS (
      SELECT 1 FROM credit_awards 
      WHERE complaint_id = NEW.complaint_id AND role = NEW.reviewer_role
    ) THEN
      INSERT INTO credit_awards (complaint_id, role, awarded)
      VALUES (NEW.complaint_id, NEW.reviewer_role, true);
      
      UPDATE profiles 
      SET credits = credits + 20 
      WHERE id = NEW.reviewer_id;
    END IF;
  END IF;
  
  -- Handle negative rating for student (from staff)
  IF NEW.rating = -1 AND NEW.reviewer_role IN ('staff', 'branch_admin') THEN
    -- Record negative event for student
    INSERT INTO negative_events (user_id, complaint_id)
    VALUES (v_complaint.student_id, NEW.complaint_id);
    
    -- Update student's lifetime negative count
    UPDATE profiles 
    SET negative_count_lifetime = negative_count_lifetime + 1
    WHERE id = v_complaint.student_id;
    
    -- Check if student should be banned (3 lifetime negatives)
    IF v_student_profile.negative_count_lifetime + 1 >= 3 THEN
      UPDATE profiles 
      SET banned_from_raise = true 
      WHERE id = v_complaint.student_id;
      
      -- Notify student
      INSERT INTO notifications (user_id, text, data)
      VALUES (
        v_complaint.student_id,
        'You have been restricted from raising concerns due to multiple negative reviews',
        jsonb_build_object('type', 'ban', 'complaint_id', NEW.complaint_id)
      );
    END IF;
  END IF;
  
  -- Handle negative rating for staff (from student)
  IF NEW.rating = -1 AND NEW.reviewer_role = 'student' THEN
    -- Get staff/trainer who handled the complaint
    DECLARE
      v_handler_id UUID;
    BEGIN
      IF v_complaint.assigned_staff_id IS NOT NULL THEN
        v_handler_id := v_complaint.assigned_staff_id;
      ELSIF v_complaint.assigned_trainer_id IS NOT NULL THEN
        v_handler_id := v_complaint.assigned_trainer_id;
      END IF;
      
      IF v_handler_id IS NOT NULL THEN
        -- Record negative event for staff/trainer
        INSERT INTO negative_events (user_id, complaint_id)
        VALUES (v_handler_id, NEW.complaint_id);
        
        -- Update lifetime negative count
        UPDATE profiles 
        SET negative_count_lifetime = negative_count_lifetime + 1
        WHERE id = v_handler_id;
        
        -- Check negatives in the past week
        SELECT COUNT(*) INTO v_staff_negatives_this_week
        FROM negative_events
        WHERE user_id = v_handler_id
        AND created_at >= NOW() - INTERVAL '7 days';
        
        -- High alert if 3 or more in a week
        IF v_staff_negatives_this_week >= 3 THEN
          UPDATE profiles 
          SET high_alert = true 
          WHERE id = v_handler_id;
          
          -- Notify staff and admins
          INSERT INTO notifications (user_id, text, data)
          VALUES (
            v_handler_id,
            'High Alert: You have received 3 negative reviews this week. Please report to admin.',
            jsonb_build_object('type', 'high_alert', 'complaint_id', NEW.complaint_id)
          );
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;