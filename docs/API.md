# API

Contrato de comunicação entre o desktop e o servidor.

> O backend **ainda não está implementado**. Este documento define o contrato que o
> servidor (a ser desenvolvido em outro repositório/OpenCode) deverá cumprir.

## Base URL

A URL base do servidor é **configurável** no desktop (campo na interface). Para
desenvolvimento, o padrão é:

```
http://localhost:3000
```

Todas as rotas são prefixadas com `/api/v1`.

## Endpoints

### `GET /api/v1/health`

Verifica a saúde do servidor.

**Resposta 200:**

```json
{
  "status": "ok",
  "timestamp": "2026-09-02T12:00:00Z"
}
```

`status` pode ser `"ok"`, `"degraded"` ou `"down"`.

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

## Timeout do Cliente

O cliente aplica um timeout de **10 segundos** por requisição. Se o servidor não
responder dentro desse período, o estado de conexão é marcado como `OFFLINE`/`ERROR`
e a interface informa o problema — sem travar o aplicativo.
