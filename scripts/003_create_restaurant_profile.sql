-- Create restaurant_profile table
CREATE TABLE IF NOT EXISTS restaurant_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brasil',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default profile
INSERT INTO restaurant_profile (name, email, phone, address, city, state, zip_code, country)
VALUES (
  'Meu Restaurante',
  'contato@restaurante.com',
  '(11) 98765-4321',
  'Rua Exemplo, 123',
  'São Paulo',
  'SP',
  '01234-567',
  'Brasil'
)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for restaurant_profile
DROP TRIGGER IF EXISTS update_restaurant_profile_updated_at ON restaurant_profile;
CREATE TRIGGER update_restaurant_profile_updated_at
  BEFORE UPDATE ON restaurant_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
