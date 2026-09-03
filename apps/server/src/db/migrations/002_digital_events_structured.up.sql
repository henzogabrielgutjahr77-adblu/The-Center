-- 002_digital_events_structured.up.sql
-- Evolui digital_events para representar o contrato canônico DigitalEvent
-- (packages/api-types/src/index.ts): author como { name, avatar? } e
-- content como { title?, body, url? }, com integridade via CHECK.

-- Remove as colunas legadas (modelo plano) e adiciona as colunas estruturadas.
-- Em desenvolvimento ainda não há dados reais; a tabela é recriada de forma
-- limpa e previsível.

ALTER TABLE digital_events DROP COLUMN IF EXISTS author;
ALTER TABLE digital_events DROP COLUMN IF EXISTS content;

ALTER TABLE digital_events ADD COLUMN author_name TEXT NOT NULL DEFAULT '';
ALTER TABLE digital_events ADD COLUMN author_avatar TEXT;

ALTER TABLE digital_events ADD COLUMN content_title TEXT;
ALTER TABLE digital_events ADD COLUMN content_body TEXT NOT NULL DEFAULT '';
ALTER TABLE digital_events ADD COLUMN content_url TEXT;

-- Integridade do contrato canônico.
ALTER TABLE digital_events
  DROP CONSTRAINT IF EXISTS digital_events_source_check;
ALTER TABLE digital_events
  ADD CONSTRAINT digital_events_source_check
  CHECK (source IN ('gmail', 'instagram', 'discord', 'youtube', 'github', 'server', 'system'));

ALTER TABLE digital_events
  DROP CONSTRAINT IF EXISTS digital_events_type_check;
ALTER TABLE digital_events
  ADD CONSTRAINT digital_events_type_check
  CHECK (type IN ('message', 'notification', 'alert', 'update', 'error', 'info'));

-- Índices úteis para consultas comuns de listagem/filtro.
CREATE INDEX IF NOT EXISTS idx_digital_events_timestamp
  ON digital_events (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_digital_events_source
  ON digital_events (source);

CREATE INDEX IF NOT EXISTS idx_digital_events_account
  ON digital_events (account);

CREATE INDEX IF NOT EXISTS idx_digital_events_source_timestamp
  ON digital_events (source, timestamp DESC);
