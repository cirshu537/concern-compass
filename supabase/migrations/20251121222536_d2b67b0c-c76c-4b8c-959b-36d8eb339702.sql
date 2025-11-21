-- Create triggers for notification functions

-- Trigger for notifying staff on new complaints
CREATE TRIGGER trigger_notify_staff_on_new_complaint
  AFTER INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_staff_on_new_complaint();

-- Trigger for notifying exclusive handlers on new complaints
CREATE TRIGGER trigger_notify_exclusive_handler_on_new_complaint
  AFTER INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_exclusive_handler_on_new_complaint();

-- Trigger for notifying students on status changes
CREATE TRIGGER trigger_notify_student_on_status_change
  AFTER UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_student_on_status_change();

-- Trigger for notifying on reviews
CREATE TRIGGER trigger_notify_on_review
  AFTER INSERT ON complaint_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_review();

-- Trigger for handling review submissions (credits and negatives)
CREATE TRIGGER trigger_handle_review_submission
  AFTER INSERT ON complaint_reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_review_submission();