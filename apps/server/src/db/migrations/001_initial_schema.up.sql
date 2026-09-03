-- 001_initial_schema.up.sql
-- Cria a tabela base do The Center: digital_events.
-- Espelha o contrato DigitalEvent (packages/api-types) para servir de fundação
-- às futuras integrações e agentes.

CREATE TABLE IF NOT EXISTS digital_events (
  id          TEXT PRIMARY KEY,
  source      TEXT NOT NULL,
  account     TEXT NOT NULL,
  type        TEXT NOT NULL,
  author      TEXT,
  timestamp   TIMESTAMPTZ NOT NULL,
  content     TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  importance  TEXT NOT NULL DEFAULT 'medium'
              CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_digital_events_timestamp
  ON digital_events (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_digital_events_source
  ON digital_events (source);
