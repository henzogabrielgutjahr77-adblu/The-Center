# API

Contrato de comunicação entre o desktop e o servidor.

> O backend **ainda não está implementado** (a ser desenvolvido em outro
> repositório/OpenCode). Este documento define o contrato que o servidor deverá
> cumprir. O Desktop já consome estes endpoints conforme descrito abaixo.

## Base URL

A URL base do servidor vem de **`VITE_SERVER_URL`** (variável de ambiente do desktop).
Para desenvolvimento, o padrão (definido em `packages/shared`) é:

```
http://localhost:3000
```

Todas as rotas são prefixadas com `/api/v1`.

## Endpoints

### `GET /api/v1/health`

Verifica a saúde do servidor. Este é o endpoint usado no fluxo de conexão do
Desktop (tela de status).

**Resposta 200 (esperada):**

```json
{
  "status": "ok"
}
```

`status` pode ser `"ok"`, `"degraded"` ou `"down"`.

`timestamp` é **opcional** (`string` ISO 8601). O Desktop valida a resposta e aceita
apenas `status` entre os valores válidos; qualquer outra forma é tratada como
"resposta inválida".

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

A futura API de eventos deve entregar objetos compatíveis com
`packages/api-types/src/index.ts`:

```json
{
  "id": "uuid",
  "source": "gmail",
  "account": "user@example.com",
  "type": "message",
  "author": { "name": "Alice", "avatar": "url-opcional" },
  "timestamp": "2026-09-02T12:00:00Z",
  "content": { "title": "...", "body": "...", "url": "url-opcional" },
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
| `content` | objeto | sim | `{ title, body, url? }` |
| `metadata` | objeto | sim | Dados adicionais |
| `importance` | enum | sim | low, medium, high, critical |
| `read` | `boolean` | sim | Status de leitura |

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
