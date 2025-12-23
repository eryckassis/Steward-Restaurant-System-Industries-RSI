-- Create inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  quantity NUMERIC,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create waste tracking table
CREATE TABLE IF NOT EXISTS waste_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Allow public read access to inventory" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to inventory" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to inventory" ON inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to inventory" ON inventory_items FOR DELETE USING (true);

CREATE POLICY "Allow public read access to activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to activity" ON activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to waste" ON waste_tracking FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to waste" ON waste_tracking FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_activity_item_id ON activity_log(item_id);
CREATE INDEX IF NOT EXISTS idx_waste_item_id ON waste_tracking(item_id);
