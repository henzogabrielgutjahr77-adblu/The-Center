# Decisões de Arquitetura

## ADR 001 — Monorepo com pnpm Workspaces

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
Precisamos compartilhar código entre cliente Windows (Tauri/React) e servidor (Express/Node).

### Decisão
Usar **pnpm workspaces** com estrutura:
```
packages/
  api-types/  # Contratos da API (DigitalEvent, HealthResponse, etc.)
  shared/     # Constantes e utilitários
apps/
  desktop/    # Tauri + React
  server/     # Express + TypeScript
```

### Alternativas Consideradas
- **npm workspaces**: Funciona, mas pnpm é mais rápido e eficiente no disco
- **Repositórios separados**: Dificulta sincronização de tipos
- **Git submodules**: Complexo para desenvolvimento

### Consequências
- `pnpm-lock.yaml` versionado
- `pnpm-workspace.yaml` na raiz
- `pnpm install` na raiz instala tudo
- Desktop usa pnpm; servidor pode usar npm ou pnpm

---

## ADR 002 — PostgreSQL como Banco Principal

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
O servidor precisa persistir DigitalEvents, usuários, configurações.

### Decisão
**PostgreSQL 17** via Docker Compose (dev) e instância gerenciada (prod).

### Justificativa
- JSONB nativo para `metadata` flexível
- Tipos avançados (TIMESTAMPTZ, enums via CHECK)
- Maturidade, ecossistema, performance
- Suporte a migrations versionadas

### Alternativas
- SQLite: Simples, mas não escala para concorrência
- MongoDB: Flexível, mas menos consistência transacional
- MariaDB/MySQL: OK, mas JSONB menos eficiente

---

## ADR 003 — DigitalEvent como Contrato Central

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
Integrações heterogêneas (Gmail, Discord, GitHub, etc.) precisam de formato unificado.

### Decisão
Definir `DigitalEvent` em `@the-center/api-types` com:
- `source`: union type (gmail, discord, github, youtube, instagram, server, system)
- `type`: union type (message, notification, alert, update, error, info)
- `author`: `{ name, avatar? }`
- `content`: `{ title, body, url? }`
- `metadata`: `Record<string, unknown>` para extensibilidade
- `importance`: low | medium | high | critical
- `read`: boolean

### Type-safety vs Flexibilidade
Usa **union types** para `source` e `type` (type-safety no cliente).
Mantém `DigitalEventSource = string` e `DigitalEventType = string` como aliases deprecated para código legado.

---

## ADR 004 — Servidor como Fonte de Verdade

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
Cliente Windows não deve armazenar dados persistentes do produto.

### Decisão
- Servidor = única fonte de verdade
- Cliente = stateless, apenas cache temporário de UI
- Zero dados sensíveis no desktop (tokens, credenciais, banco)
- Apenas preferências de UI no `localStorage` (ex: URL do servidor)

### Implementação
- Desktop usa `fetch` com CSP restrito
- Tauri com permissões mínimas (`core:default` apenas)
- Sem filesystem, shell, ou HTTP nativo no Tauri

---

## ADR 005 — Express + TypeScript para Servidor

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
API HTTP simples, previsível, sem overhead de frameworks complexos.

### Decisão
**Express 5** + **TypeScript strict** + **Zod** para validação.

### Bibliotecas Principais
- `express` 5.x - roteamento, middleware
- `pg` - driver PostgreSQL (pool, tipado)
- `zod` - validação de env vars e input
- `pino` - logger estruturado (redaction de segredos)
- `dotenv` - configuração via .env

### Padrões
- Shutdown graceful (SIGINT/SIGTERM)
- Error handling centralizado (`HttpError`, `errorHandler`)
- Request logging estruturado
- Health checks com DB ping

---

## ADR 006 — Migrations SQL Versionadas

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
Schema do banco deve evoluir de forma rastreável e reversível.

### Decisão
Migrations em `apps/server/src/db/migrations/`:
- `NNN_nome.up.sql` — aplica
- `NNN_nome.down.sql` — reverte
- Tabela `schema_migrations` rastreia aplicadas
- Runner simples em TypeScript (`tsx`)

### Exemplo
```
001_initial_schema.up.sql   -- cria digital_events, schema_migrations
001_initial_schema.down.sql -- drop tables
```

---

## ADR 007 — Segurança: Zero Secrets no Código

**Data**: 2026-09-02
**Status**: Aceito

### Regras
- `.env` **nunca** versionado (`.gitignore`)
- `.env.example` versionado com placeholders
- Logger redage: `authorization`, `cookie`, `password`, `secret`, `token`, `apiKey`
- Credenciais apenas via variáveis de ambiente
- HTTPS/TLS obrigatório em produção
- Nenhuma criptografia própria

---

## ADR 007 — Package Manager: pnpm (com suporte npm)

**Data**: 2026-09-02
**Status**: Aceito

### Contexto
Desktop (Windows) usa pnpm. Servidor (Debian) foi desenvolvido com npm.

### Decisão
**pnpm como padrão** (workspaces, lockfile versionado).
Servidor continua funcionando com `npm` (workspaces compatíveis).
`package.json` tem scripts para ambos os fluxos.

### Arquivos
- `pnpm-workspace.yaml` — define workspaces
- `pnpm-lock.yaml` — lockfile versionado
- `package.json` — scripts npm, workspaces npm, devDependencies

---

## ADR 008 — Porta do Servidor: 4000

**Data**: 2026-09-02
**Status**: Aceito

### Decisão
Servidor roda na **porta 4000** (configurável via `PORT` env var).
Desktop usa `VITE_SERVER_URL=http://localhost:4000` como padrão.

### Justificativa
- 3000 frequentemente usado por outros serviços (React dev, etc.)
- 4000 livre na maioria dos ambientes
- Configurável para produção