# Roadmap

## Fase 1 — Fundação (✅ Concluída)

- [x] Monorepo configurado (pnpm workspaces)
- [x] Cliente Windows (Tauri 2 + React + Rust)
- [x] Servidor Express + TypeScript + PostgreSQL
- [x] Tipos compartilhados (`@the-center/api-types`)
- [x] Constantes compartilhadas (`@the-center/shared`)
- [x] Health/Version endpoints (`/health`, `/version`, `/api/v1/*`)
- [x] Docker Compose para PostgreSQL
- [x] Migrations versionadas
- [x] Logger estruturado (pino) com redaction de segredos
- [x] Tratamento de erros consistente
- [x] Testes básicos (health/version)
- [x] Documentação (ARCHITECTURE, API, SECURITY, DATABASE)

## Fase 2 — Autenticação e Autorização (🔄 Próxima)

- [ ] JWT tokens (access + refresh)
- [ ] Registro/login de usuários
- [ ] Middleware de autenticação
- [ ] Roles/permissões (admin, user)
- [ ] Rate limiting
- [ ] HTTPS/TLS obrigatório em produção

## Fase 3 — DigitalEvent Pipeline (📋 Planejado)

- [ ] API CRUD para DigitalEvents
- [ ] Ingestão de eventos via HTTP
- [ ] WebSocket para tempo real
- [ ] Filtros/busca (source, type, importance, date range)
- [ ] Paginação
- [ ] Soft delete

## Fase 4 — Integrações Externas (📋 Planejado)

> Cada integração transforma dados brutos em `DigitalEvent`.

- [ ] Gmail (messages, labels)
- [ ] Instagram (DMs, mentions)
- [ ] Discord (messages, mentions)
- [ ] YouTube (comments, notifications)
- [ ] GitHub (issues, PRs, releases)
- [ ] Webhooks genéricos

## Fase 5 — Agentes (📋 Planejado)

### SocialAgent
- Monitora integrações sociais
- Normaliza para DigitalEvent
- Filtra ruído, detecta prioridade

### ServerAgent
- Monitora infraestrutura (CPU, RAM, disk, services)
- Gera alertas como DigitalEvents
- Ações remotas controladas (reiniciar serviço, etc.)

## Fase 6 — IA e Automação (📋 Planejado)

- [ ] Classificação automática de importância
- [ ] Sumarização de eventos
- [ ] Ações sugeridas
- [ ] Browser automation (Playwright)
- [ ] Workflows configuráveis

## Fase 7 — Observabilidade (📋 Planejado)

- [ ] Métricas (Prometheus)
- [ ] Traces (OpenTelemetry)
- [ ] Alertas (Alertmanager)
- [ ] Dashboard (Grafana)

## Fase 8 — Hardening (📋 Planejado)

- [ ] Testes de integração completos
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy automatizado
- [ ] Backup/restore PostgreSQL
- [ ] Disaster recovery