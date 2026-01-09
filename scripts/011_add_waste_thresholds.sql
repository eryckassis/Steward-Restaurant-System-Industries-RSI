-- Add waste threshold configuration to system_settings
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS waste_safe_threshold NUMERIC DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS waste_critical_threshold NUMERIC DEFAULT 300.00;

COMMENT ON COLUMN system_settings.waste_safe_threshold IS 'Safe zone limit for waste - values below this are green';
COMMENT ON COLUMN system_settings.waste_critical_threshold IS 'Critical zone limit for waste - values above this are red';
