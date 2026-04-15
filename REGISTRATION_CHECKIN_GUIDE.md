# Registration Check-In Implementation Guide

## Overview
This document outlines the new registration check-in feature added to the HackX 2.0 platform.

## Feature Description
Users now have a registration check-in status displayed on their profile page. This allows:
- **Registration Desk Admins**: Scan user QR codes at registration to mark check-in
- **Users**: See their check-in status on their profile page
- **System**: Track who has checked in for the hackathon

## What's New

### 1. New Database Table
- **Table:** `registration_logs`
- **Fields:**
  - `id` - UUID primary key
  - `user_id` - References the user (UNIQUE - one check-in per user)
  - `checked_in_at` - When they checked in
  - `scanned_by` - Admin ID who processed the check-in

### 2. Updated Profile Page
The user profile now displays two status sections:

**Registration Check-In Status**
- Shows if user has checked in at registration desk
- Displays checkmark (✓) when checked in
- Located above the food checklist

**Food Checklist** (Existing)
- Shows meals collected (unchanged)

### 3. Profile Type Update
`app/providers/auth-provider.tsx` - Profile type remains compatible

### 4. Profile UI Updates
`app/profile/page.tsx`
- Added `registrationChecked` state
- Added `fetchingRegistration` state
- Fetches registration status on profile load
- Displays registration check-in card with status

## User Journey

### For Users:
1. User logs in and goes to `/profile`
2. Sees "Check-In Status" section
3. If not checked in: Shows pending status
4. If checked in: Shows "Checked In" confirmation

### For Registration Desk Admins:
1. Use `/scan` page to scan user QR codes
2. Select "registration" mode (to be implemented)
3. Scan user QR codes to mark them as checked in
4. System confirms check-in

## Database Migrations Required

Before deploying, you must apply these migrations in order:

1. **Avatar Gender Migration** (if not already applied)
   - File: `scripts/add_avatar_gender_migration.sql`

2. **Registration Logs Table**
   - File: `scripts/add_registration_logs_table.sql`
   - Creates the registration_logs table
   - Sets up RLS policies

## Next Steps: Scan Page Enhancement

The scan page will need to be updated to support registration check-ins:

```typescript
// Pseudo-code for scan page enhancement
const [scanType, setScanType] = useState<'food' | 'registration'>('food');

// If registration mode:
// - Insert into registration_logs instead of food_logs
// - Show different success message
// - Display check-in confirmation

const handleRegistrationScan = async (userId: string) => {
  await supabase
    .from('registration_logs')
    .upsert({
      user_id: userId,
      checked_in_at: new Date().toISOString(),
      scanned_by: user?.id
    }, {
      onConflict: 'user_id'
    });
  
  toast.success(`✓ ${participantName} checked in!`);
};
```

## Files Modified

1. **scripts/setup_schema.sql**
   - Added registration_logs table definition

2. **scripts/add_registration_logs_table.sql** (NEW)
   - Migration to create registration_logs table and policies

3. **scripts/MIGRATION_README.md**
   - Updated with registration logs information

4. **app/profile/page.tsx**
   - Added registration check-in display
   - Added fetch for registration status
   - Added state management for registration data

5. **README.md**
   - Updated database setup instructions

## Testing Checklist

- [ ] Apply all database migrations successfully
- [ ] Profile page loads without errors
- [ ] Registration check-in status displays correctly
- [ ] Food checklist still works
- [ ] Build compiles successfully

## Future Enhancement: Scan Page Integration

The `/scan` page will be enhanced to:
- Add a toggle for "Food" vs "Registration" mode
- Support registration desk check-ins
- Provide appropriate feedback for each scan type
- Track both food logs and registration logs

## Deployment Notes

1. Ensure database migrations are applied before deploying code
2. All users will initially show "Not Checked In"
3. Check-in status becomes available once scanned at registration desk
4. Changes are backward compatible with existing food log functionality
