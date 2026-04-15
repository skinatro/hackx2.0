-- Supabase Schema for HackX 2.0

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  team_name text,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'leader', 'member')),
  domain text,
  avatar_gender text DEFAULT 'male' CHECK (avatar_gender IN ('male', 'female')),
  created_at timestamptz DEFAULT now()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text UNIQUE NOT NULL,
  project_name text NOT NULL,
  github_url text NOT NULL,
  website_url text,
  description text,
  image_urls text[] DEFAULT '{}',
  submitted_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Config Table
CREATE TABLE IF NOT EXISTS public.config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 4. Food Logs Table
CREATE TABLE IF NOT EXISTS public.food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal text NOT NULL,
  scanned_at timestamptz DEFAULT now(),
  scanned_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, meal)
);

-- 5. Registration Logs Table
CREATE TABLE IF NOT EXISTS public.registration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  checked_in_at timestamptz DEFAULT now(),
  scanned_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_logs ENABLE ROW LEVEL SECURITY;

-- Note: config table RLS is disabled to allow public read access to configuration settings
-- ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust as needed)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Projects are viewable by everyone" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Teams can edit their own project" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.team_name = public.projects.team_name
    )
  );

-- Config table policies (readable by all, writable by admins only)
CREATE POLICY "Config is viewable by everyone" ON public.config
  FOR SELECT USING (true);

CREATE POLICY "Admins can update config" ON public.config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

-- Food logs policies
CREATE POLICY "Food logs are viewable by admins" ON public.food_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage food logs" ON public.food_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

-- Registration logs policies
CREATE POLICY "Registration status is viewable by everyone" ON public.registration_logs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage registration logs" ON public.registration_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

-- Insert essential config
INSERT INTO public.config (key, value, description)
VALUES 
  ('hackathon_start_time', '2026-04-13T09:00:00+05:30', 'Start time of the hackathon'),
  ('hackathon_end_time', '2026-04-14T12:00:00+05:30', 'End time of the hackathon'),
  ('submissions_enabled', 'true', 'Whether to accept project submissions')
ON CONFLICT (key) DO NOTHING;
