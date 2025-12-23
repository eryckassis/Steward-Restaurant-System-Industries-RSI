-- Enable Row Level Security on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_items table
-- Users can view all inventory items (for now, we'll add user_id column later if needed)
CREATE POLICY "Allow authenticated users to view inventory" 
ON inventory_items FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert inventory" 
ON inventory_items FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory" 
ON inventory_items FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to delete inventory" 
ON inventory_items FOR DELETE 
TO authenticated 
USING (true);

-- Create policies for activity_log table
CREATE POLICY "Allow authenticated users to view activity" 
ON activity_log FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert activity" 
ON activity_log FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policies for restaurant_profile table
-- Users can only view and update their own profile
CREATE POLICY "Users can view their own profile" 
ON restaurant_profile FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON restaurant_profile FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON restaurant_profile FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
