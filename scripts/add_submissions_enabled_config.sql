-- filepath: c:\ASK_Main\ASK_SFIT_BE_CO\CSI\google-hackathon\scripts\add_submissions_enabled_config.sql
-- Migration: Add submissions_enabled config for controlling project submissions

-- Insert the submissions_enabled config if it doesn't exist
INSERT INTO public.config (key, value, description)
VALUES ('submissions_enabled', 'true', 'Whether to accept project submissions')
ON CONFLICT (key) DO NOTHING;
