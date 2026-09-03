-- 002_digital_events_structured.down.sql
-- Reverte a evolução para o modelo estruturado: volta ao modelo plano legado.
-- ATENÇÃO: este down só é usado para reverter a última migration em dev;
-- quaisquer dados estruturados existentes são descartados das colunas novas.

ALTER TABLE digital_events
  DROP CONSTRAINT IF EXISTS digital_events_type_check;
ALTER TABLE digital_events
  DROP CONSTRAINT IF EXISTS digital_events_source_check;

ALTER TABLE digital_events DROP COLUMN IF EXISTS content_url;
ALTER TABLE digital_events DROP COLUMN IF EXISTS content_body;
ALTER TABLE digital_events DROP COLUMN IF EXISTS content_title;
ALTER TABLE digital_events DROP COLUMN IF EXISTS author_avatar;
ALTER TABLE digital_events DROP COLUMN IF EXISTS author_name;

ALTER TABLE digital_events ADD COLUMN author TEXT;
ALTER TABLE digital_events ADD COLUMN content TEXT NOT NULL DEFAULT '';
