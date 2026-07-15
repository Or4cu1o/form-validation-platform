# Plataforma de Governança e Automação de Indicadores de TI

Plataforma web para digitalizar, centralizar e auditar o processo de confecção do
Relatório Operacional de TI das unidades da organização, substituindo o modelo
legado baseado em planilhas/documentos manuais por um fluxo governado por prazos
em dias úteis, trilha de auditoria e um motor de formulários dinâmicos
administrável sem código.

Consulte [`PROMPT.md`](./PROMPT.md) para a especificação de requisitos completa
que orientou o desenho do produto.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS 10 + Prisma ORM + PostgreSQL |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Autenticação | JWT (Bearer), RBAC por role e unidade |
| Armazenamento de evidências | S3-compatível (MinIO em dev) |
| E-mail | SMTP via Nodemailer (modo log quando não configurado) |
| Testes backend | Jest (unit + integração contra Postgres real) |
| Testes frontend | Vitest + Testing Library |
| Monorepo | npm workspaces (`apps/api`, `apps/web`) |

## Arquitetura

```
apps/
  api/    NestJS — API REST, regras de negócio, Prisma, cron de abertura de período
  web/    React (Vite) — SPA consumindo a API via Bearer JWT
```

- **Estado Residente**: dados estruturais estáveis (inventário, licenças, links)
  são clonados automaticamente na virada do mês pelo motor de cron do backend,
  reduzindo retrabalho do Elaborador.
- **Engine No-Code de Formulários**: Administradores criam/editam templates,
  tópicos e indicadores (com fórmula, operador e meta) sem alterar código —
  mudanças refletem nos relatórios futuros mantendo o histórico intacto.
- **Soft delete obrigatório**: nenhuma entidade (usuário, unidade, indicador) é
  fisicamente excluída — desativação via `is_active = false`, preservando a
  integridade referencial histórica.

### Roles (RBAC)

| Role | Escopo |
|---|---|
| Observador | Leitura de relatórios da própria unidade e unidades permitidas |
| Elaborador | Preenche variáveis e evidências da própria unidade |
| Revisor | Valida/edita dados da unidade antes de enviar à Matriz |
| Aprovador | Audita e aprova/reprova indicadores de todas as unidades |
| Administrador | Acesso irrestrito — usuários, unidades e Engine No-Code |

O RBAC do frontend é só UX (oculta ações que o usuário não pode fazer); a
autorização real é sempre revalidada pelo backend em cada requisição — ver
[`apps/web/SECURITY-NOTES.md`](./apps/web/SECURITY-NOTES.md#2-rbac-no-frontend-é-apenas-ux--a-autorização-real-é-sempre-no-backend).

## Pré-requisitos

- Node.js 20+ (desenvolvido/testado com Node 24)
- Docker + Docker Compose (Postgres, MinIO)
- npm (workspaces do monorepo)

## Configuração

1. Copie o `.env` de exemplo e ajuste os valores (segredos, credenciais do
   admin inicial, portas):

   ```bash
   cp .env.example .env
   ```

2. Suba a infraestrutura local (Postgres + MinIO):

   ```bash
   npm run docker:up
   ```

3. Instale as dependências do monorepo:

   ```bash
   npm install
   ```

4. Rode as migrations e o seed do banco:

   ```bash
   cd apps/api
   npx prisma migrate deploy
   npx prisma db seed
   ```

   O seed garante o admin inicial (`INITIAL_ADMIN_*` do `.env`) e, fora de
   `NODE_ENV=production`, cinco usuários de teste — um por role — todos com
   senha `RtioTeste@2026` (ver saída do comando no console).

## Rodando em desenvolvimento

Cada app roda em seu próprio processo; as portas vêm do `.env` raiz
(`API_PORT`, `WEB_PORT`):

```bash
# terminal 1 — API (carrega o .env da raiz do monorepo)
npm run dev:api

# terminal 2 — frontend
npm run dev:web
```

O frontend lê `VITE_API_URL` do `.env` para saber onde está a API
(default `http://localhost:7000` se a variável não estiver definida).

## Testes

```bash
# suíte completa (api + web)
npm test

# só a API (Jest — precisa de DATABASE_URL apontando para um Postgres real,
# os testes de integração não usam mocks)
npm run test --workspace=apps/api

# só o frontend (Vitest + Testing Library)
npm run test --workspace=apps/web -- run

# cobertura do frontend
npm run test --workspace=apps/web -- run --coverage
```

## Build de produção

```bash
npm run build
```

Compila `apps/api` (NestJS → `dist/`) e `apps/web` (Vite → `dist/`, SPA
estática). Cabeçalhos de segurança HTTP (CSP, HSTS, etc.) devem ser
configurados na camada de hospedagem/reverse proxy — ver
[`apps/web/SECURITY-NOTES.md`](./apps/web/SECURITY-NOTES.md#7-cabeçalhos-de-segurança-http-csp-hsts-etc).

## Segurança

Decisões e riscos aceitos deliberadamente estão documentados em:

- [`apps/api/SECURITY-NOTES.md`](./apps/api/SECURITY-NOTES.md)
- [`apps/web/SECURITY-NOTES.md`](./apps/web/SECURITY-NOTES.md)

## Licença

Distribuído sob a licença MIT — ver [`LICENSE`](./LICENSE).
