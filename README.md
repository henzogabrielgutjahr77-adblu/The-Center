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
│   └── server/         # Backend (a ser desenvolvido separadamente)
├── packages/
│   ├── api-types/      # Contratos de tipos compartilhados da API
│   └── shared/         # Constantes e utilitários compartilhados
├── docs/               # Documentação
├── docker/             # Configurações Docker (futuras)
├── .gitignore
└── README.md
```

## Requisitos

- **Node.js** >= 20
- **pnpm** >= 9
- **Rust** (stable) com toolchain MSVC
- **Visual Studio Build Tools 2022** com workload "Desktop development with C++"
- **WebView2** (já incluído no Windows 11)

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

## Comunicação com o Servidor

O desktop se comunica com o servidor através de HTTP. A URL padrão é:

```
http://localhost:3000
```

A URL pode ser alterada na interface do aplicativo (campo "URL do servidor") e é
persistida localmente apenas como preferência de UI (não é dado do produto).

Endpoints consumidos:

- `GET /api/v1/health`
- `GET /api/v1/version`

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
