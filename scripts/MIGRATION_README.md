# Database Migrations Guide

## Overview
This guide covers all database migrations needed for the HackX 2.0 platform.

## Migrations Available

### 1. Avatar Gender Field Migration
**File:** `add_avatar_gender_migration.sql`

Adds support for user avatar gender selection to the profiles table.

**Changes:**
- Adds `avatar_gender` column to `profiles` table
- Default value: `'male'`
- Allowed values: `'male'` or `'female'`

### 2. Registration Logs Table Migration
**File:** `add_registration_logs_table.sql`

Creates the registration logs table for tracking user check-ins at the registration desk.

**Changes:**
- Creates `registration_logs` table with:
  - `id` (UUID primary key)
  - `user_id` (References auth.users, UNIQUE - one check-in per user)
  - `checked_in_at` (Timestamp, defaults to now)
  - `scanned_by` (Admin user ID who processed the check-in)
- Enables Row Level Security with policies

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. For each migration file:
   - Open the file in your text editor
   - Copy the entire content
   - Paste into the SQL Editor
   - Click **Run** to execute
4. Apply in order:
   - `add_avatar_gender_migration.sql` (if not already applied)
   - `add_registration_logs_table.sql`

### Option 2: Using Supabase CLI
```bash
# Create migration files
supabase migration add add_avatar_gender
supabase migration add add_registration_logs

# Copy contents of .sql files into the generated migration files
# Then push
supabase db push
```

## Migration SQL Details

### Avatar Gender Migration
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_gender text DEFAULT 'male' 
CHECK (avatar_gender IN ('male', 'female'));

UPDATE public.profiles 
SET avatar_gender = 'male' 
WHERE avatar_gender IS NULL;
```

### Registration Logs Table Migration
```sql
CREATE TABLE IF NOT EXISTS public.registration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  checked_in_at timestamptz DEFAULT now(),
  scanned_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.registration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registration status" ON public.registration_logs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage registration logs" ON public.registration_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );
```

## Rollback Instructions

If you need to rollback migrations:

**Remove Avatar Gender Column:**
```sql
ALTER TABLE public.profiles DROP COLUMN avatar_gender;
```

**Remove Registration Logs Table:**
```sql
DROP TABLE public.registration_logs;
```

## Related Code Files

### Profile Type Update
- **File:** `app/providers/auth-provider.tsx`
- **Change:** Added optional `avatar_gender` field to Profile type

### Profile UI
- **File:** `app/profile/page.tsx`
- **Changes:**
  - Avatar display card with male/female toggle
  - Registration check-in status display
  - Food checklist (existing)

### Scan/Check-In
- **File:** `app/scan/page.tsx`
- **Current:** Handles food log scanning
- **Next:** Will be enhanced to handle registration desk scanning

### User Import
- **File:** `app/api/admin/import-users/route.ts`
- **Change:** Sets `avatar_gender` to `'male'` by default on import

## Testing Checklist

- [ ] Avatar gender field works on profile page
- [ ] Avatar toggle (male/female) updates display
- [ ] Registration check-in displays correctly
- [ ] Food logs still work as expected
- [ ] Admin can scan QR codes for registration at desk
- [ ] User import sets avatar_gender to 'male'
