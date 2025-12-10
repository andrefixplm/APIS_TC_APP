# Teamcenter Gateway API

> Gateway de API Node.js/Express para abstrair e simplificar chamadas às APIs do Teamcenter (SOA/REST/AWC)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Instalação e Configuração](#instalação-e-configuração)
- [Configuração de Logging (Desenvolvimento vs Produção)](#configuração-de-logging-desenvolvimento-vs-produção)
- [Uso da API](#uso-da-api)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Troubleshooting](#troubleshooting)
- [Decisões Técnicas](#decisões-técnicas)

---

## 🎯 Visão Geral

O **Teamcenter Gateway** é um Backend-for-Frontend (BFF) que atua como intermediário entre aplicações frontend e as APIs complexas do Teamcenter. Ele oferece:

- ✅ **Abstração de APIs**: Simplifica payloads complexos do Teamcenter
- ✅ **Autenticação Stateless**: Gerenciamento de tokens via JWT
- ✅ **Validação de Dados**: Schemas Joi para validação de entrada
- ✅ **Logging Detalhado**: Winston com níveis configuráveis
- ✅ **Tratamento de Erros**: Mensagens amigáveis em PT-BR
- ✅ **Type Safety**: TypeScript com strict mode

---

## 🏗️ Arquitetura

O projeto segue o **Repository Pattern** com separação em camadas:

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│   Routes    │  ← Define endpoints HTTP
└──────┬──────┘
       ▼
┌─────────────┐
│ Controllers │  ← Orquestra requisições
└──────┬──────┘
       ▼
┌─────────────┐
│  Services   │  ← Lógica de negócio
└──────┬──────┘
       ▼
┌─────────────┐
│Repositories │  ← Acesso a dados (Teamcenter)
└──────┬──────┘
       │ REST API
       ▼
┌─────────────┐
│ Teamcenter  │
└─────────────┘
```

### Estrutura de Diretórios

```
teamcenter-gateway/
├── src/
│   ├── config/           # Configurações (env, logger, teamcenter)
│   ├── models/           # Interfaces TypeScript
│   ├── repositories/     # Acesso a dados (Teamcenter APIs)
│   ├── services/         # Lógica de negócio
│   ├── controllers/      # Orquestração HTTP
│   ├── routes/           # Definição de rotas
│   ├── middleware/       # Middlewares Express
│   ├── app.ts            # Configuração Express
│   └── server.ts         # Inicialização do servidor
├── .env.example          # Template de variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- **Node.js** 18+ e **npm** 9+
- Acesso a um servidor **Teamcenter** com REST API habilitada

### 2. Instalação

```bash
# Clonar o repositório (ou navegar até o diretório)
cd c:\DADOS\PROGRAMACAO\AUTOMACAO\PYTHON\APIs_TEAMCENTER_APP\teamcenter-gateway

# Instalar dependências
npm install
```

### 3. Configuração de Variáveis de Ambiente

```bash
# Copiar template de .env
copy .env.example .env

# Editar .env com suas credenciais
notepad .env
```

**Variáveis obrigatórias no `.env`:**

```bash
# Teamcenter
TC_BASE_URL=http://seu-servidor-teamcenter:8080
TC_USERNAME=seu_usuario
TC_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua-chave-secreta-complexa-aqui

# Logging (IMPORTANTE!)
LOG_LEVEL=debug  # Para desenvolvimento
```

### 4. Executar o Servidor

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Modo produção (compilar + executar)
npm run build
npm start
```

O servidor estará disponível em: **http://localhost:3000**

---

## 🔍 Configuração de Logging (Desenvolvimento vs Produção)

### ⚠️ ATENÇÃO: Segurança de Logging

O sistema de logging possui dois modos distintos:

| Modo | LOG_LEVEL | Comportamento | Uso |
|------|-----------|---------------|-----|
| **Desenvolvimento** | `debug` | Loga **TUDO**, incluindo payloads completos, credenciais e dados PLM | ✅ Ambiente isolado |
| **Produção** | `info` ou `warn` | Loga apenas informações essenciais, **SEM dados sensíveis** | ✅ Ambiente público |

---

### 📝 Como Alterar o Nível de Logging

#### **Opção 1: Editar arquivo `.env`**

```bash
# Abrir .env
notepad .env

# Alterar a variável LOG_LEVEL:

# Para DESENVOLVIMENTO (logging detalhado):
LOG_LEVEL=debug

# Para PRODUÇÃO (logging seguro):
LOG_LEVEL=info
```

#### **Opção 2: Variável de ambiente no sistema**

```bash
# Windows PowerShell
$env:LOG_LEVEL="info"
npm start

# Linux/Mac
export LOG_LEVEL=info
npm start
```

---

### 🛡️ O que é Logado em Cada Nível

#### **DEBUG (Desenvolvimento)**

```json
{
  "level": "debug",
  "message": "Teamcenter Request: POST /tc/rest/items",
  "payload": {
    "item_id": "000123",
    "object_name": "Componente X",
    "credentials": "DADOS SENSÍVEIS EXPOSTOS"
  }
}
```

**⚠️ NUNCA use em produção!**

#### **INFO (Produção)**

```json
{
  "level": "info",
  "message": "Teamcenter Request: POST /tc/rest/items"
}
```

**✅ Seguro para produção**

---

### 🔧 Verificar Nível de Logging Atual

Ao iniciar o servidor, você verá:

```
=============================================================
🚀 TEAMCENTER GATEWAY INICIADO COM SUCESSO
=============================================================
Nível de Log: debug
=============================================================
⚠️  ATENÇÃO: Logging em modo DEBUG (payloads completos)
⚠️  NUNCA use este modo em produção!
⚠️  Para produção, altere LOG_LEVEL para "info" ou "warn" no .env
```

---

### 📂 Logs em Arquivo

Os logs também são salvos em arquivos (se `LOG_DIR` estiver configurado):

```
logs/
├── error.log      # Apenas erros
└── combined.log   # Todos os níveis
```

Para **desabilitar logs em arquivo**, remova ou comente a variável `LOG_DIR` no `.env`:

```bash
# LOG_DIR=./logs  ← Comentar esta linha
```

---

## 📡 Uso da API

### 1. Autenticação

```bash
# Login (retorna JWT)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tc_user",
    "password": "tc_password"
  }'

# Resposta:
{
  "success": true,
  "user": {
    "username": "tc_user",
    "userId": "user123"
  },
  "auth": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### 2. Buscar Item

```bash
# Usar token obtido no login
curl -X GET http://localhost:3000/api/items/000123 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Resposta:
{
  "success": true,
  "data": {
    "id": "abc123",
    "itemId": "000123",
    "name": "Componente X",
    "description": "Descrição do componente",
    "type": "Item"
  }
}
```

### 3. Criar Item

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "TEST-001",
    "name": "Item de Teste",
    "description": "Criado via Gateway"
  }'
```

### 4. Buscar Items

```bash
# Busca personalizada
curl -X POST http://localhost:3000/api/search \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "item_id:000*",
    "maxResults": 10
  }'

# Busca por tipo
curl -X GET "http://localhost:3000/api/search/type/Item?maxResults=20" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📚 Endpoints Disponíveis

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login no Teamcenter |
| POST | `/api/auth/logout` | Logout do Teamcenter |
| POST | `/api/auth/refresh` | Renovar token JWT |

### Items

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/items/:id` | Buscar Item por ID |
| GET | `/api/items/uid/:uid` | Buscar Item por UID |
| POST | `/api/items` | Criar novo Item |
| PUT | `/api/items/:id` | Atualizar Item |
| DELETE | `/api/items/:id` | Deletar Item |
| GET | `/api/items/:id/revisions` | Buscar revisões |

### Busca

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/search` | Busca personalizada |
| GET | `/api/search/type/:type` | Buscar por tipo |
| GET | `/api/search/item-id/:itemId` | Buscar por Item ID (wildcards) |
| GET | `/api/search/saved-queries` | Listar Saved Queries |
| POST | `/api/search/saved-query/:name` | Executar Saved Query |

### Utilitários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/` | Informações da API |

---

## 🔧 Troubleshooting

### Erro: "Token expirado ou inválido"

**Solução**: Faça login novamente para obter um novo token.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "tc_user", "password": "tc_password"}'
```

### Erro: "Conexão recusada pelo Teamcenter"

**Causas possíveis**:
1. URL do Teamcenter incorreta no `.env`
2. Servidor Teamcenter offline
3. Firewall bloqueando a conexão

**Solução**: Verificar `TC_BASE_URL` no `.env` e conectividade de rede.

### Erro: "Permissão negada no Teamcenter"

**Solução**: Verificar se o usuário tem permissões adequadas no Teamcenter.

### Logs não aparecem

**Solução**: Verificar `LOG_LEVEL` no `.env`. Para ver todos os logs, use `LOG_LEVEL=debug`.

---

## 💡 Decisões Técnicas

### Por que Repository Pattern?

- **Testabilidade**: Fácil criar mocks dos repositórios
- **Manutenibilidade**: Mudanças na API Teamcenter ficam isoladas
- **Reutilização**: Repositórios podem ser usados por múltiplos serviços

### Por que JWT em vez de sessões?

- **Stateless**: Gateway não precisa armazenar estado
- **Escalabilidade**: Funciona com load balancers sem sticky sessions
- **Microsserviços**: Preparado para arquitetura distribuída

### Por que Winston para logging?

- **Flexibilidade**: Múltiplos transports (console, arquivo, serviços externos)
- **Formato estruturado**: JSON facilita parsing e análise
- **Níveis configuráveis**: Debug em dev, info em produção

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:

- **Teamcenter REST API Docs**: [Siemens PLM Documentation](https://docs.plm.automation.siemens.com/)
- **Logs do servidor**: `logs/error.log` e `logs/combined.log`

---

## 📄 Licença

ISC

---

**Desenvolvido por**: Andre PLM Team  
**Versão**: 1.0.0  
**Data**: 2025-12-10
