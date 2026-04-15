-- Migration: Add registration_logs table for check-in tracking
-- This table tracks when users check in at the registration desk

-- Create registration_logs table
CREATE TABLE IF NOT EXISTS public.registration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  checked_in_at timestamptz DEFAULT now(),
  scanned_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.registration_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to check registration status
CREATE POLICY "Anyone can view registration status" ON public.registration_logs
  FOR SELECT USING (true);

-- Allow admins to insert/update registration logs
CREATE POLICY "Admins can manage registration logs" ON public.registration_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );
