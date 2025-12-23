-- Insert sample inventory items
INSERT INTO inventory_items (name, category, quantity, unit, min_stock, cost_per_unit, supplier, last_restocked) VALUES
  ('Tomatoes', 'Vegetables', 50, 'kg', 20, 2.50, 'Fresh Farm Co.', NOW() - INTERVAL '2 days'),
  ('Chicken Breast', 'Meat', 30, 'kg', 15, 8.99, 'Quality Meats Inc.', NOW() - INTERVAL '1 day'),
  ('Olive Oil', 'Oils', 25, 'L', 10, 12.99, 'Mediterranean Imports', NOW() - INTERVAL '5 days'),
  ('Pasta', 'Grains', 100, 'kg', 40, 1.99, 'Italian Foods Ltd.', NOW() - INTERVAL '7 days'),
  ('Mozzarella', 'Dairy', 15, 'kg', 10, 6.50, 'Dairy Fresh', NOW() - INTERVAL '1 day'),
  ('Bell Peppers', 'Vegetables', 8, 'kg', 15, 3.20, 'Fresh Farm Co.', NOW() - INTERVAL '3 days'),
  ('Ground Beef', 'Meat', 25, 'kg', 20, 7.99, 'Quality Meats Inc.', NOW() - INTERVAL '2 days'),
  ('Garlic', 'Vegetables', 5, 'kg', 3, 4.50, 'Fresh Farm Co.', NOW() - INTERVAL '4 days'),
  ('Basil', 'Herbs', 2, 'kg', 5, 8.00, 'Herb Garden', NOW() - INTERVAL '1 day'),
  ('Parmesan', 'Dairy', 12, 'kg', 8, 15.99, 'Dairy Fresh', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Insert sample activity log entries
INSERT INTO activity_log (item_id, action, quantity, description, created_at)
SELECT 
  id,
  'restock',
  quantity,
  'Initial stock added',
  created_at
FROM inventory_items
WHERE created_at > NOW() - INTERVAL '1 hour'
ON CONFLICT DO NOTHING;
