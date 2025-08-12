# 📝 API de Autenticação com NestJS

Este é um projeto desenvolvido para uma API RESTful de cadastro e login de usuários utilizando JWT com Refresh Token, garantindo segurança e escalabilidade. A aplicação foi construída com o framework NestJS, utilizando MySQL como banco de dados e Docker para facilitar a execução em ambientes de desenvolvimento e produção.

---

## 🛠️ Tecnologias Utilizadas

* ⚙️ Backend: NestJS
* 🗄️ Banco de Dados: MySQL
* 🐳 Containerização: Docker
* 🧪 Testes Unitários: Jest
* 📚 Documentação: OpenAPI (Swagger)
* 🔐 Segurança: Argon2, JWT + Refresh Token, Helmet, Rate Limiting

---

## 🚀 Instalação e Execução

Para executar este projeto localmente, siga os passos abaixo.

### ✅ Pré-requisitos

* 🐳 Docker
* 📦 Docker Compose
* 📋 Node.js (para executar comandos locais se desejar)

---

### 📦 Ambiente de Desenvolvimento

Este ambiente é ideal para codificar, pois inclui hot reload, logs verbosos e facilidades para debugging.

1. Configure as variáveis de ambiente:

```bash
cp .env.example .env.dev
```

Ajuste as variáveis em `.env.local` conforme seu ambiente local.

2. Inicie os contêineres:

```bash
docker compose -f docker-compose.dev.yml up --build
```

3. Acesse a API em:

```
http://localhost:3000
```

E a documentação Swagger em:

```
http://localhost:3000/api/docs
```

---

### 📦 Ambiente de Produção

Este ambiente gera imagens otimizadas e seguras, sem hot reload e sem dependências de desenvolvimento.

1. Configure as variáveis de ambiente:

```bash
cp .env.example .env.prod
```

Ajuste `.env.prod` para valores de produção (senhas fortes, URLs reais, etc).

2. Inicie os contêineres:

```bash
docker compose --env-file .env -f docker-compose.prod.yml up --build
```

---

## 📄 Documentação da API (Swagger)

A API possui uma documentação interativa gerada automaticamente com Swagger (OpenAPI), permitindo testar os endpoints diretamente pelo navegador.

* Acesse em: `http://localhost:3000/api/docs`

---

## 📌 Endpoints Principais da API

| Método | Rota           | Descrição                     | Autenticação |
| ------ | -------------- | ----------------------------- | ------------ |
| POST   | /auth/register | Registrar novo usuário        | Não          |
| POST   | /auth/login    | Login e geração de tokens     | Não          |
| POST   | /auth/refresh  | Renovar tokens de acesso      | Não          |
| GET    | /auth/profile  | Obter perfil do usuário atual | Sim (JWT)    |
| POST   | /auth/logout   | Logout do usuário             | Sim (JWT)    |

---

### Exemplo de Requisição para Registro

```json
{
  "email": "usuario@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "password": "SenhaForte123!"
}
```

Resposta de sucesso (201 Created):

```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@example.com",
    "firstName": "João",
    "lastName": "Silva"
  },
  "expiresIn": 900
}
```

---

## 🧪 Testes Automatizados

O projeto possui uma suíte de testes unitários para controllers e services, garantindo a qualidade das funcionalidades críticas.

* Localização: `test/unit/auth/`
* Comandos para execução:

```bash
npm run test        # Executa testes unitários
npm run test:cov    # Gera relatório de cobertura
```

A estratégia usa mocks para isolar dependências e garantir testes rápidos e confiáveis.

---

## 🧱 Decisões Arquiteturais no Backend

1. **Arquitetura Modular (DDD + Clean Architecture)**
   O projeto está dividido em módulos (`auth`, `users`, `common`), cada um cuidando de uma responsabilidade específica, facilitando a escalabilidade e manutenção.

2. **Segurança em Camadas**

   * Senha armazenada com Argon2, resistente a ataques modernos.
   * JWT + Refresh Token com rotação para mitigar roubos.
   * Rate Limiting para evitar ataques de força bruta.
   * Uso do Helmet para headers HTTP seguros.
   * Validação rigorosa com DTOs e `class-validator`.

3. **Padrão Repository**
   Separação clara entre `Service`, `Repository` e `Entity`, promovendo testabilidade e flexibilidade.

4. **Injeção de Dependência (DI)**
   Facilita a substituição de componentes e promove baixo acoplamento.

5. **Docker com Ambientes Separados**
   Facilita o desenvolvimento com hot reload e depuração, e produção com builds otimizados e seguros.

---

## 📂 Estrutura de Diretórios

```
src/
├── auth/
│   ├── controllers/
│   ├── dto/
│   ├── entities/
│   ├── guards/
│   ├── interfaces/
│   ├── repositories/
│   ├── services/
│   ├── strategies/
│   └── auth.module.ts
├── users/
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── users.module.ts
├── common/
│   ├── config/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
│   └── common.module.ts
├── app.module.ts
└── main.ts
```

---

## ⚙️ Comandos Úteis

* Rodar a aplicação em desenvolvimento:

```bash
docker compose -f docker-compose.dev.yml up --build
```

* Rodar testes unitários:

```bash
npm run test
```

* Gerar relatório de cobertura:

```bash
npm run test:cov
```

* Rodar aplicação em produção:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---
