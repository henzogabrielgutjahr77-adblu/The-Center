# Banco de Dados

## PostgreSQL

O servidor utiliza **PostgreSQL 17** como banco de dados principal.

### Configuração (Desenvolvimento)

```yaml
# docker/compose.dev.yml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: thecenter
      POSTGRES_PASSWORD: thecenter_dev_password
      POSTGRES_DB: thecenter
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U thecenter -d thecenter"]
      interval: 5s
      timeout: 5s
      retries: 10
```

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string completa | `postgres://user:pass@localhost:5432/thecenter` |

### Migrations

As migrations são versionadas e localizadas em:

```
apps/server/src/db/migrations/
```

Formato: `NNN_nome.up.sql` / `NNN_nome.down.sql`

Execução:
```bash
npm run migrate --workspace @the-center/server
```

Reversão (última migration):
```bash
npm run migrate --workspace @the-center/server -- down
```

### Tabelas

#### `digital_events`

Tabela principal para armazenar eventos digitais normalizados.

```sql
CREATE TABLE digital_events (
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

CREATE INDEX idx_digital_events_timestamp ON digital_events (timestamp DESC);
CREATE INDEX idx_digital_events_source ON digital_events (source);
```

#### `schema_migrations`

Rastreia migrations aplicadas.

```sql
CREATE TABLE schema_migrations (
  name       TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Health Check

```sql
SELECT 'ok' AS ok;
```

### Conexão

O servidor usa pool de conexões (`pg.Pool`) com:
- Max: 10 conexões
- Idle timeout: 30s
- Connection timeout: 5s

### Segurança

- Credenciais **nunca** no código (apenas via `DATABASE_URL` env var)
- Connection string não logada (redaction no logger)
- Pool nomeado (`application_name: 'the-center-server'`)