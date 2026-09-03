# API

Contrato de comunicação entre o desktop e o servidor.

> Este documento define o contrato que o servidor cumpre. O Desktop já consome
> estes endpoints conforme descrito abaixo.

## Base URL

A URL base do servidor vem de **`VITE_SERVER_URL`** (variável de ambiente do desktop).
Para desenvolvimento, o padrão (definido em `packages/shared`) é:

```
http://localhost:4000
```

Todas as rotas são prefixadas com `/api/v1`.

## Endpoints

### `GET /api/v1/health`

Verifica a saúde do servidor. Este é o endpoint usado no fluxo de conexão do
Desktop (tela de status).

**Resposta 200 (esperada):**

```json
{
  "status": "ok",
  "timestamp": "2026-09-02T12:00:00Z",
  "uptime": 42,
  "startedAt": "2026-09-02T11:59:18Z"
}
```

`status` pode ser `"ok"`, `"degraded"` ou `"down"`.

`timestamp` é **obrigatório** (`string` ISO 8601, não-vazia). `uptime` e
`startedAt` são opcionais. O cliente valida a resposta: `status` deve estar entre
os valores válidos e `timestamp` deve ser uma string não-vazia; qualquer outra
forma é tratada como "resposta inválida".

### `GET /api/v1/events`

Lista os eventos digitais canônicos, ordenados por `timestamp` decrescente.

**Query params:**

| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `limit` | `int` | `50` | Máximo de itens retornados (limite global: `50`) |
| `offset` | `int` | `0` | Quantos eventos pular do início |

**Resposta 200:**

```json
{
  "items": [  /* DigitalEvent[] canônico, ver abaixo */ ]
}
```

**Resposta 500 (erro de banco):** `ApiError` estruturado.

### `GET /api/v1/version`

Retorna a versão do servidor.

**Resposta 200:**

```json
{
  "version": "0.1.0",
  "name": "the-center-server"
}
```

## Tipo Compartilhado: DigitalEvent

O contrato canônico de evento é definido em `packages/api-types/src/index.ts`
e é o formato real entregue por `GET /api/v1/events`:

```json
{
  "id": "uuid",
  "source": "system",
  "account": "development",
  "type": "info",
  "author": { "name": "The Center", "avatar": null },
  "timestamp": "2026-09-02T12:00:00Z",
  "content": { "title": "Servidor online", "body": "The Center server is online", "url": null },
  "metadata": {},
  "importance": "medium",
  "read": false
}
```

Campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | sim | Identificador único |
| `source` | enum | sim | gmail, instagram, discord, youtube, github, server, system |
| `account` | `string` | sim | Conta associada |
| `type` | enum | sim | message, notification, alert, update, error, info |
| `author` | objeto | sim | `{ name, avatar? }` |
| `timestamp` | `string` (ISO8601) | sim | Momento do evento |
| `content` | objeto | sim | `{ title?, body, url? }` (`body` obrigatório) |
| `metadata` | objeto | sim | Dados adicionais |
| `importance` | enum | sim | low, medium, high, critical |
| `read` | `boolean` | sim | Status de leitura |

`avatar`, `content.title` e `content.url` podem ser `null` quando ausentes.

## Comportamento do Desktop (Fluxo de Conexão)

Ao abrir o `The Center.exe`:

1. Lê a URL do servidor de **`VITE_SERVER_URL`** (vindo da configuração do Vite).
2. Exibe o estado **"Verificando conexão..."**.
3. Chama `GET /api/v1/health`.
4. Se a resposta for **HTTP 200** e o corpo for válido (`status` = ok/degraded/down):
   exibe **"Servidor conectado"**.
5. Se houver timeout, falha de rede, HTTP não-2xx ou resposta inválida: exibe
   **"Servidor indisponível"** com o motivo, e um botão "Tentar novamente".

Estados da tela de conexão:

| Estado | Exibição |
|--------|----------|
| `connecting` | Verificando conexão... |
| `online` | Servidor conectado |
| `offline` | Servidor indisponível |

Ao conectar, o Dashboard também busca os eventos recentes e de atividade via
`GET /api/v1/events`. O `unreadCount` exibido no Header é derivado dos eventos
recebidos (contagem de `read === false`). Estados de **carregando**, **erro de
conexão** e **lista vazia** são tratados na interface.

A URL padrão oficial é `http://localhost:4000` (sem reintroduzir a porta 3000).

## Cliente HTTP

A comunicação é isolada em `apps/desktop/src/lib/api/`:

- `client.ts` — cliente HTTP genérico (fetch centralizado, com timeout e validação)
- `errors.ts` — tipos de erro tipados (`NetworkError`, `TimeoutError`, `ApiError`,
  `ValidationError`)
- `config.ts` — leitura da URL do servidor (via `VITE_SERVER_URL`)
- `health.ts` — chamada dedicada ao health check

Os componentes React não chamam `fetch()` diretamente; eles usam esta camada.

## Timeout do Cliente

O cliente aplica um timeout de **10 segundos** por requisição. Se o servidor não
responder dentro desse período, o estado de conexão é marcado como **Servidor
indisponível** (timeout) e a interface informa o problema — sem travar o aplicativo.
