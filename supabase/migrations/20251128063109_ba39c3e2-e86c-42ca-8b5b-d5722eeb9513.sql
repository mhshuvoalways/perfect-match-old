-- Add photo_url column to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS photo_url TEXT;