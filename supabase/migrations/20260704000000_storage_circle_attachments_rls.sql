-- Add RLS policies for circle-attachments bucket

-- Public read
CREATE POLICY "Public read circle attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'circle-attachments');

-- User can upload to own folder
-- Path: circles/{circleId}/{userId}/{timestamp}.{ext}
CREATE POLICY "Users upload own circle attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'circle-attachments'
  AND auth.uid()::text = (storage.foldername(name))[3]
);

-- User can update own attachment
CREATE POLICY "Users update own circle attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'circle-attachments'
  AND auth.uid()::text = (storage.foldername(name))[3]
);

-- User can delete own attachment
CREATE POLICY "Users delete own circle attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'circle-attachments'
  AND auth.uid()::text = (storage.foldername(name))[3]
);
