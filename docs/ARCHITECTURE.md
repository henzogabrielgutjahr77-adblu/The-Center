# Arquitetura

## Visão Geral

```
┌─────────────────────┐      HTTPS      ┌──────────────────────┐
│   Desktop (Tauri)   │ ──────────────► │      Servidor        │
│  - React frontend   │                 │  - API REST          │
│  - Rust nativo      │ ◄────────────── │  - Fonte de verdade  │
└─────────────────────┘                 └──────────────────────┘
```

## Princípios

1. **O servidor é a fonte de verdade.** Nenhum dado persistente do produto fica no
   executável desktop (com exceção de preferências de UI não-sensíveis, como a URL do
   servidor).

2. **Separação frontend/nativo.** O código React é independente das capacidades
   nativas do Tauri. A comunicação com o backend usa `fetch` no frontend.

3. **Permissões mínimas.** O Tauri concede apenas as permissões estritamente
   necessárias. Nenhuma permissão de filesystem, shell ou credenciais está habilitada
   nesta etapa.

4. **Sem dados fictícios.** O cliente não inventa eventos nem dados. Ele apenas exibe
   o que o servidor fornece.

## Desktop (apps/desktop)

```
src/
├── api/
│   ├── client.ts       # Cliente HTTP base (fetch + timeout)
│   ├── health.ts       # (futuro) chamada dedicada a health
│   └── version.ts      # (futuro) chamada dedicada a version
├── components/         # Componentes React de UI pura
├── pages/              # Páginas da aplicação
├── state/              # (futuro) gerenciamento de estado global
├── types/              # (futuro) tipos locais de UI
└── App.tsx             # Componente raiz (conexão + status)
```

### Fluxo de Inicialização

1. Carregar configuração do servidor (URL)
2. Tentar conexão com timeout (10s)
3. Chamar `GET /api/v1/health`
4. Chamar `GET /api/v1/version`
5. Exibir estado da conexão

### Estados de Conexão

| Estado | Descrição |
|--------|-----------|
| `CONNECTING` | Tentando conectar ao servidor |
| `ONLINE` | Conexão estabelecida com sucesso |
| `OFFLINE` | Servidor indisponível |
| `ERROR` | Erro na comunicação |

## Pacotes Compartilhados

### packages/api-types

Define os contratos de tipos entre cliente e servidor:

- `DigitalEvent` — evento digital (id, source, account, type, author, timestamp,
  content, metadata, importance, read)
- `HealthResponse` — resposta de `/api/v1/health`
- `VersionResponse` — resposta de `/api/v1/version`

### packages/shared

Constantes e utilitários compartilhados (nome do app, versão, URL padrão, timeout).

## Áreas Futuras

O desktop apresentará duas áreas principais:

- **VIDA DIGITAL** — alimentada pelo **SocialAgent** no backend
- **SERVIDOR** — alimentada pelo **ServerAgent** no backend

> **Ainda não implementadas.** O desktop apenas presenta os dados fornecidos pelo
> servidor. Não há SocialAgent nem ServerAgent nesta etapa.

## Funcionalidades Ainda Não Implementadas

- Gmail, Instagram, Discord, YouTube, GitHub (integrações)
- IA e SocialAgent / ServerAgent
- Browser automation
- Armazenamento de credenciais
- Banco de dados local
- Sincronização complexa
- Funcionalidades completas do produto
