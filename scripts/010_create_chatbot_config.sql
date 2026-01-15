CREATE TABLE IF NOT EXISTS chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  llm_provider TEXT NOT NULL DEFAULT 'openai',
  llm_model TEXT NOT NULL DEFAULT 'gpt-5',
  api_key TEXT,
  search_region TEXT DEFAULT 'São Paulo, SP',
  enabled_tools TEXT[] DEFAULT ARRAY['inventory_search', 'generate_pdf', 'generate_markdown', 'supermarket_search'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE chatbot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot config"
  ON chatbot_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chatbot config"
  ON chatbot_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chatbot config"
  ON chatbot_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);
