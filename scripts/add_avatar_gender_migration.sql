-- Migration: Add avatar_gender column to profiles table
-- This adds support for user avatar gender selection (styling only)

-- Add the avatar_gender column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_gender text DEFAULT 'male' CHECK (avatar_gender IN ('male', 'female'));

-- Set all existing profiles to 'male' by default
UPDATE public.profiles 
SET avatar_gender = 'male' 
WHERE avatar_gender IS NULL;
