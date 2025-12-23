-- Criar tabela de movimentações de estoque (entrada/saída)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste', 'desperdicio')),
  quantity NUMERIC NOT NULL,
  previous_quantity NUMERIC NOT NULL,
  new_quantity NUMERIC NOT NULL,
  reason TEXT,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'critical_stock', 'waste', 'restock', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para stock_movements
CREATE POLICY "Allow public read access to stock_movements" ON stock_movements
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to stock_movements" ON stock_movements
  FOR INSERT WITH CHECK (true);

-- Políticas para notifications
CREATE POLICY "Allow public read access to notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to notifications" ON notifications
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to notifications" ON notifications
  FOR DELETE USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Atualizar tabela waste_tracking para referenciar item corretamente
ALTER TABLE waste_tracking 
  ADD COLUMN IF NOT EXISTS item_name TEXT;
