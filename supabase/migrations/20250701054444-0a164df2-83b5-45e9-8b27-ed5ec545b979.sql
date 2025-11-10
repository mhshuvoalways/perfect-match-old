
-- Create the resumes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to view files
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
