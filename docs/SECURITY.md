# Segurança

## A Fonte de Verdade

O **executável desktop NÃO é a fonte de verdade dos dados**. Todas as informações
persistentes do usuário ficam no **servidor**. O desktop apenas consulta e apresenta
os dados fornecidos pela API.

## O que o Desktop NÃO Armazena

O desktop **não armazena permanentemente**:

- OAuth tokens
- API keys
- Senhas
- Credenciais
- Dados completos das integrações
- Banco principal
- Histórico completo dos eventos

## O que o Desktop Armazena (apenas preferências de UI)

A única coisa persistida localmente é a **URL do servidor** (preferência de interface,
não-sensível). Isto fica no `localStorage` da WebView.

## Comunicação

- A comunicação com o backend será realizada via **HTTPS/TLS** em produção.
- Para desenvolvimento, usa-se HTTP local (`http://localhost:4000`).

## Criptografia

- **Não implementamos criptografia própria.**
- Não há chave permanente hardcoded dentro do executável.
- Não há secrets no código.

## Variáveis de Ambiente

- Arquivos `.env` **não são versionados** (ver `.gitignore`).
- Não existe `.env` neste repositório.
- Configurações sensíveis devem vir de variáveis de ambiente do servidor, não do
  cliente desktop.

## Permissões Tauri

O Tauri está configurado com **permissões mínimas**. A capability `default` inclui
apenas `core:default`, que fornece as funcionalidades básicas de janela e ciclo de
vida.

**NÃO habilitadas** (nesta etapa):

- Filesystem (`fs:`)
- Shell (`shell:`)
- Diálogos de arquivo
- Processos filhos
- HTTP nativo (comunicação é via `fetch` no frontend com CSP restrito)

### CSP

Uma Content Security Policy é configurada no Tauri para restringir as origens com
as quais a aplicação pode se comunicar:

```
default-src 'self'; connect-src 'self' http:* https:*; img-src 'self' data:; style-src 'self' 'unsafe-inline'
```

> Em produção, a CSP deve ser endurecida para permitir apenas a URL real do servidor.

## Checklist de Segurança

- [x] Nenhum secret no código
- [x] Nenhum `.env` versionado
- [x] Sem banco de dados local
- [x] Sem criptografia própria
- [x] Permissões Tauri minimizadas
- [x] URL do servidor configurável (não hardcoded de produção)
