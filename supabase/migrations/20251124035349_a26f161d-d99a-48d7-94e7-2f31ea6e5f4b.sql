
-- Drop duplicate triggers on complaint_reviews table
DROP TRIGGER IF EXISTS trigger_handle_review_submission ON complaint_reviews;
DROP TRIGGER IF EXISTS trigger_notify_on_review ON complaint_reviews;

-- Keep only the original triggers:
-- on_review_submitted (calls handle_review_submission)
-- on_review_created (calls notify_on_review)
