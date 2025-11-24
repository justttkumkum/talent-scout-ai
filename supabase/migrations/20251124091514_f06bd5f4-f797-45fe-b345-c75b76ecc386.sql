-- Create enum for candidate types
CREATE TYPE candidate_type AS ENUM ('backend', 'frontend', 'fullstack');

-- Create enum for education categories
CREATE TYPE education_category AS ENUM ('State Board', 'CBSE', 'ICSE', 'IB', 'Other');

-- Create enum for recommendation status
CREATE TYPE recommendation_status AS ENUM ('Recommended', 'Not Recommended', 'Pending');

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  tech_stack TEXT[] NOT NULL,
  resume_url TEXT NOT NULL,
  candidate_type candidate_type,
  technical_skill_score INTEGER CHECK (technical_skill_score >= 0 AND technical_skill_score <= 10),
  experience_relevance_score INTEGER CHECK (experience_relevance_score >= 0 AND experience_relevance_score <= 10),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 10),
  education_quality_score INTEGER CHECK (education_quality_score >= 0 AND education_quality_score <= 10),
  education_category education_category,
  strengths TEXT,
  weaknesses TEXT,
  recommendation recommendation_status DEFAULT 'Pending',
  zapier_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert applications (public form)
CREATE POLICY "Anyone can submit applications"
  ON public.applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anyone to read applications (for now - can be restricted later)
CREATE POLICY "Anyone can view applications"
  ON public.applications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX idx_applications_recommendation ON public.applications(recommendation);