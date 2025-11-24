-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anyone to upload resumes
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');

-- Policy: Allow anyone to read resumes
CREATE POLICY "Anyone can view resumes"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'resumes');