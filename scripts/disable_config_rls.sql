-- filepath: scripts/disable_config_rls.sql
-- Migration: Disable RLS on config table for public read access
-- This allows all users to read configuration settings without RLS policy restrictions

ALTER TABLE public.config DISABLE ROW LEVEL SECURITY;
