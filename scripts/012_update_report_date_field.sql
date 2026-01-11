-- Update system_settings to use next_report_date instead of pdf_report_day
ALTER TABLE system_settings 
DROP COLUMN IF EXISTS pdf_report_day,
ADD COLUMN IF NOT EXISTS next_report_date date DEFAULT CURRENT_DATE + INTERVAL '1 month';

-- Update existing records to set next_report_date based on current date
UPDATE system_settings 
SET next_report_date = CURRENT_DATE + INTERVAL '1 month'
WHERE next_report_date IS NULL;
