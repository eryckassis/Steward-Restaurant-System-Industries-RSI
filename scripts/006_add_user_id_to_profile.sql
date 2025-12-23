-- Add user_id column to restaurant_profile table
ALTER TABLE restaurant_profile 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurant_profile_user_id ON restaurant_profile(user_id);

-- Enable RLS on restaurant_profile
ALTER TABLE restaurant_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON restaurant_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON restaurant_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON restaurant_profile;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" 
ON restaurant_profile FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON restaurant_profile FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON restaurant_profile FOR INSERT 
WITH CHECK (auth.uid() = user_id);
