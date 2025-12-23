-- Add image_url column to inventory table
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add phone and 2FA columns to user metadata (Supabase Auth handles this)
-- No changes needed as Supabase Auth stores this in auth.users table
