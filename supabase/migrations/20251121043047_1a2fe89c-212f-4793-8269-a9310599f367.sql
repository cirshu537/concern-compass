-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', false);

-- Create storage policies
CREATE POLICY "Students can upload their own attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can view their own attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'complaint-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Staff can view all attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'complaint-attachments' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'branch_admin', 'main_admin', 'trainer')
  )
);

-- Add attachment_url column to complaints table
ALTER TABLE complaints
ADD COLUMN attachment_url TEXT;
