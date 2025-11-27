-- 1. Create the 'uploads' bucket (Private by default for security)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false);

-- 2. Policy: Allow any logged-in user to UPLOAD a file
-- They can only upload to their own folder (e.g., uploads/user_id/resume.pdf)
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Policy: Allow users to UPDATE their own file (e.g. replace resume)
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow users to DELETE their own file
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow users to VIEW/DOWNLOAD their OWN file
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);