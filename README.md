# The Center

Plataforma central para gerenciar sua vida digital e servidor.

> **IMPORTANTE**: A fonte de verdade dos dados é o **servidor**. O desktop é apenas um
> cliente que consulta a API. Nenhum dado persistente do produto fica armazenado no
> executável local.

## Estrutura do Monorepo

```
the-center/
├── apps/
│   ├── desktop/        # Cliente Windows (Tauri 2 + React + TypeScript + Rust)
│   └── server/         # Backend (Express + TypeScript + PostgreSQL)
├── packages/
│   ├── api-types/      # Contratos de tipos compartilhados da API
│   └── shared/         # Constantes e utilitários compartilhados
├── docs/               # Documentação
├── docker/             # Configurações Docker (PostgreSQL dev)
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
└── README.md
```

## Requisitos

### Comum
- **Node.js** >= 20

### Desktop (Windows)
- **pnpm** >= 9
- **Rust** (stable) com toolchain MSVC
- **Visual Studio Build Tools 2022** com workload "Desktop development with C++"
- **WebView2** (já incluído no Windows 11)

### Servidor (Linux/Debian)
- **npm** >= 10 (ou pnpm)
- **Docker** + **Docker Compose** (para PostgreSQL)
- **PostgreSQL** 17 (via Docker Compose)

## Início Rápido (Desktop)

```bash
# Instalar dependências (na raiz do repositório)
pnpm install

# Rodar em desenvolvimento
pnpm --filter @the-center/desktop tauri dev

# Compilar frontend
pnpm --filter @the-center/desktop build

# Compilar + empacotar build Windows
pnpm --filter @the-center/desktop tauri build
```

## Início Rápido (Servidor)

```bash
# Instalar dependências
npm install

# Subir PostgreSQL
npm run db:up

# Rodar migrations
npm run migrate --workspace @the-center/server

# Desenvolvimento (com hot reload)
npm run dev

# Build de produção
npm run build

# Iniciar servidor
npm start
```

## Comunicação com o Servidor

O desktop se comunica com o servidor através de HTTP. A URL padrão é:

```
http://localhost:4000
```

A URL pode ser alterada na interface do aplicativo (campo "URL do servidor") e é
persistida localmente apenas como preferência de UI (não é dado do produto).

Endpoints implementados:

- `GET /health` / `GET /api/v1/health`
- `GET /version` / `GET /api/v1/version`

Endpoints futuros:
- `GET /api/v1/events` — lista de DigitalEvents
- `POST /api/v1/events` — criar evento
- WebSocket para tempo real

## Áreas Futuras

O desktop apresentará duas áreas principais:

- **VIDA DIGITAL** — alimentada pelo **SocialAgent** no backend
- **SERVIDOR** — alimentada pelo **ServerAgent** no backend

> Estes agentes **ainda não estão implementados**. O desktop apenas apresenta os dados
> fornecidos pelo servidor.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Segurança](docs/SECURITY.md)
- [Banco de Dados](docs/DATABASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Decisões](docs/DECISIONS.md)

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha os valores reais:

```bash
cp .env.example .env
```

NUNCA commite o arquivo `.env` (ver `.gitignore` e `docs/SECURITY.md`).