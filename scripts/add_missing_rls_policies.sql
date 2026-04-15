-- filepath: scripts/add_missing_rls_policies.sql
-- Migration: Add missing RLS policies for config, food_logs, and registration_logs tables
-- This fixes issues with accessing and updating configuration settings

-- Config table policies (readable by all, writable by admins only)
DROP POLICY IF EXISTS "Config is viewable by everyone" ON public.config;
CREATE POLICY "Config is viewable by everyone" ON public.config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update config" ON public.config;
CREATE POLICY "Admins can update config" ON public.config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

-- Food logs policies
DROP POLICY IF EXISTS "Food logs are viewable by admins" ON public.food_logs;
CREATE POLICY "Food logs are viewable by admins" ON public.food_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage food logs" ON public.food_logs;
CREATE POLICY "Admins can manage food logs" ON public.food_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

-- Registration logs policies
DROP POLICY IF EXISTS "Registration status is viewable by everyone" ON public.registration_logs;
CREATE POLICY "Registration status is viewable by everyone" ON public.registration_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage registration logs" ON public.registration_logs;
CREATE POLICY "Admins can manage registration logs" ON public.registration_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );
