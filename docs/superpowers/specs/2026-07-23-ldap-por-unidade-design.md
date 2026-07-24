# Design: Integração LDAP por Unidade (backend)

**Data**: 2026-07-23
**Status**: Aprovado para planejamento
**Escopo**: somente backend (`apps/api`). Frontend fica para uma etapa futura.

## Contexto

Hoje a autenticação (`apps/api/src/auth`) é local: `AuthService.validateCredentials` busca o usuário por matrícula/e-mail e compara a senha com bcrypt. Usuários têm um único `role` (`RoleName`) e uma `primaryUnitId`. Não existe nenhuma dependência ou configuração LDAP no projeto.

O objetivo é permitir que cada `Unit` associe um ou mais servidores/configurações de Active Directory (LDAP), de forma que usuários daquela unidade façam login com suas credenciais de domínio (estilo login do Windows: `DOMINIO\usuario` ou `usuario@dominio`, nunca e-mail — e-mail é exclusivo do fluxo local/Azure). Grupos do AD mapeiam automaticamente para os cargos Observador, Elaborador e Revisor. Aprovador e Administrador nunca são concedidos automaticamente — apenas sugeridos por grupo e sempre confirmados manualmente por um Administrador já existente na plataforma, para impedir que a gestão de grupos no AD (tipicamente feita pelo time de TI/infra) controle acesso administrativo do sistema.

## Objetivos

- Login via bind LDAP contra o AD configurado da unidade do usuário, coexistindo com o login local (bcrypt) — a fonte de autenticação é decidida por usuário, não globalmente por unidade.
- Cada unidade pode ter múltiplas configurações LDAP: para redundância de DCs (mesmo domínio, múltiplos hosts) e/ou para domínios AD distintos apontando pra mesma unidade.
- Mapeamento de grupo → cargo restrito, na prática, a mudanças automáticas apenas para Observador/Elaborador/Revisor. Grupos mapeados para Aprovador/Administrador geram uma solicitação de elevação pendente de aprovação manual.
- Usuário não precisa informar a unidade manualmente no dia a dia — só na primeira vez que loga e ainda não existe registro local (bootstrap), via popup de seleção.
- Nenhuma mudança de contrato para os módulos que já dependem de `User.role` / `User.primaryUnitId` (guards, `@Roles`, notificações) — a integração LDAP só afeta como o usuário é autenticado e provisionado.

## Não-objetivos

- Nenhuma tela de administração de LDAP no frontend (fica para depois — só os endpoints backend).
- Nenhuma tela de popup de seleção de unidade no frontend (o backend expõe o contrato; a UI vem depois).
- Sincronização periódica em background dos grupos do AD (fora do login) — fica fora de escopo por ora; o sync acontece a cada login.
- SSO/Kerberos/NTLM — o método de autenticação é bind LDAP simples (usuário + senha) sobre LDAPS/StartTLS.

## Modelo de dados

```prisma
enum AuthSource {
  LOCAL
  LDAP

  @@map("auth_source")
}

enum ElevationStatus {
  PENDING
  APPROVED
  REJECTED
  REVOKED

  @@map("elevation_status")
}

model LdapConfig {
  id                    String   @id @default(uuid())
  unitId                String   @map("unit_id")
  name                  String                              // rótulo administrativo, ex: "AD Matriz"
  domain                String   @unique                    // NetBIOS ("EMPRESA") ou UPN suffix ("empresa.local"); usado para resolver DOMINIO\user / user@dominio no bootstrap
  hosts                 String[]                            // DCs em ordem de tentativa (failover dentro do mesmo domínio)
  port                  Int      @default(636)
  useTls                Boolean  @default(true) @map("use_tls")
  bindDn                String   @map("bind_dn")            // conta de serviço usada para buscar o usuário/grupos
  bindPasswordEncrypted String   @map("bind_password_encrypted") // AES-256-GCM, nunca em texto plano
  baseDn                String   @map("base_dn")
  isActive              Boolean  @default(true) @map("is_active")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  unit          Unit               @relation(fields: [unitId], references: [id])
  groupMappings LdapGroupMapping[]
  users         User[]             @relation("LdapConfigUsers")

  @@index([unitId])
  @@map("ldap_configs")
}

model LdapGroupMapping {
  id           String   @id @default(uuid())
  ldapConfigId String   @map("ldap_config_id")
  groupDn      String   @map("group_dn")
  role         RoleName                                     // qualquer uma das 5; comportamento (auto vs elevação) decidido no service
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  ldapConfig LdapConfig @relation(fields: [ldapConfigId], references: [id])

  @@unique([ldapConfigId, groupDn, role])
  @@map("ldap_group_mappings")
}

model RoleElevationRequest {
  id            String          @id @default(uuid())
  userId        String          @map("user_id")
  requestedRole RoleName                                     // APROVADOR | ADMINISTRADOR
  status        ElevationStatus @default(PENDING)
  sourceGroupDn String          @map("source_group_dn")
  reviewedById  String?         @map("reviewed_by_id")
  reviewedAt    DateTime?       @map("reviewed_at")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  user       User  @relation("ElevationRequests", fields: [userId], references: [id])
  reviewedBy User? @relation("ElevationReviewedBy", fields: [reviewedById], references: [id])

  @@index([userId, status])
  @@map("role_elevation_requests")
}
```

Alterações em modelos existentes:

- `User`: adiciona `authSource AuthSource @default(LOCAL)`, `ldapConfigId String?`, `ldapUsername String?` (sAMAccountName usado no bind), relações `elevationRequests` e `reviewedElevations`. `passwordHash` passa a ser opcional (`String?`) — obrigatório apenas quando `authSource = LOCAL` (validado em serviço, não no schema).
- `Unit`: adiciona `ldapEnabled Boolean @default(false)` e relação `ldapConfigs LdapConfig[]`. Controla se a unidade aparece na lista de bootstrap e se aceita provisionamento LDAP novo.

## Fluxo de login

`POST /auth/login` passa a aceitar `{ identifier, password, unitId? }` (campo `unitId` opcional, novo).

1. Busca usuário local por `matricula`, `email` ou `ldapUsername` ativo.
2. **Encontrado com `authSource = LOCAL`**: fluxo atual (bcrypt), inalterado.
3. **Encontrado com `authSource = LDAP`**: usa o `ldapConfigId` já gravado no registro (a unidade já é conhecida — nunca tenta outras configs), tenta bind contra os `hosts` daquela config em ordem até um responder. Em caso de sucesso, roda o sync de grupos (ver abaixo). Falha de bind ou config inativa → erro genérico.
4. **Não encontrado (nem local, nem LDAP)**:
   - Se `identifier` estiver no formato `DOMINIO\usuario` ou `usuario@dominio`, resolve a `LdapConfig` pelo campo `domain` e tenta bind direto (sem exigir `unitId`).
   - Senão, sem `unitId`: responde `428 Precondition Required` com corpo `{ code: 'UNIT_SELECTION_REQUIRED', units: [...] }`, listando unidades com `ldapEnabled = true` via `GET /auth/ldap-units` (endpoint público, retorna só `id`, `sigla`, `nome`).
   - Com `unitId` informado: tenta bind contra as configs LDAP ativas dessa unidade. Sucesso → provisiona (ver abaixo). Qualquer falha (usuário não existe no AD daquela unidade, senha errada, unidade errada escolhida) → **sempre** `401 Credenciais inválidas`, sem diferenciar o motivo na resposta. O motivo real é gravado apenas em log/auditoria interna, nunca exposto na API — decisão explícita para evitar enumeração de usuários.
5. Emite o mesmo JWT de sempre (`AuthService.login`), sem mudanças no payload ou nos guards existentes.

### Provisionamento (primeiro login bem-sucedido via LDAP)

Cria `User` com `authSource = LDAP`, `primaryUnitId` da unidade resolvida, `ldapConfigId`, `ldapUsername` (sAMAccountName), `nome`/`sobrenome`/`email` lidos do AD (`givenName`/`sn`/`mail`) **apenas nesse momento** — não são mais re-sincronizados depois. Cargo inicial calculado pelo sync de grupos abaixo.

### Sincronização de grupos (todo login LDAP, não só o primeiro)

- Recalcula o cargo a partir dos grupos mapeados atuais no AD, com prioridade **Revisor > Elaborador > Observador** quando o usuário pertence a mais de um grupo mapeado.
- Se o usuário não pertence a nenhum grupo mapeado (para O/E/R), o login é bloqueado com erro genérico — evita usuário "órfão" de cargo.
- Grupos mapeados para Aprovador/Administrador **nunca** rebaixam ou promovem automaticamente o `role` — apenas criam/mantêm um `RoleElevationRequest` (ver abaixo). Perda do grupo antes da aprovação marca a solicitação pendente como `REVOKED`.
- Se a conta estiver desabilitada no AD (`userAccountControl` com bit `ACCOUNTDISABLE`) ou não for encontrada na busca de revalidação, o login é negado e o usuário é marcado `isActive = false` localmente — nesse caso, `role` (incluindo Aprovador/Administrador manual) não importa, o acesso é sempre bloqueado.

## Fila de elevação (Aprovador / Administrador)

- `RoleElevationRequest` é criado (status `PENDING`) quando o sync de grupos encontra o usuário num grupo mapeado para Aprovador ou Administrador, e ainda não existe uma solicitação pendente idêntica.
- Endpoints administrativos (`@Roles(ADMINISTRADOR)`):
  - `GET /admin/elevation-requests?status=PENDING`
  - `POST /admin/elevation-requests/:id/approve` → seta `user.role = requestedRole`, `status = APPROVED`, `reviewedById`, `reviewedAt`.
  - `POST /admin/elevation-requests/:id/reject` → `status = REJECTED`, `reviewedById`, `reviewedAt`.
- Ao criar uma solicitação, notifica administradores por e-mail reaproveitando `NotificationsService` (novo método `notifyElevationRequested`, seguindo o padrão de `notifySubmittedForApproval`).
- Aprovar/rejeitar/revogar grava em `AuditLog` (`tableName: 'role_elevation_requests'`).

## Segurança

- **Bind password**: criptografada em repouso com AES-256-GCM; chave vem de `LDAP_CONFIG_ENCRYPTION_KEY` (nova env obrigatória, validada em `env.validation.ts`). Nunca logada, nunca retornada por nenhum endpoint (DTOs de leitura omitem o campo).
- **LDAP injection**: todo valor vindo do usuário usado para montar filtros (`sAMAccountName`, grupo) passa por escaping RFC 4515 antes de compor o filtro LDAP.
- **Transporte**: LDAPS (porta 636) ou StartTLS por padrão (`useTls = true`); certificado validado (sem `rejectUnauthorized: false` por padrão).
- **Timeouts**: connect/bind com timeout curto (ex.: 5s) para não travar a request nem abrir vetor de DoS via DC lento/indisponível.
- **Enumeração de usuários**: erro de login sempre genérico ("Credenciais inválidas") para todos os casos de falha LDAP, replicando o padrão já usado no fluxo local.
- **Rate limiting**: reaproveita o `@Throttle` já existente em `/auth/login` (5/60s); `GET /auth/ldap-units` recebe throttle próprio mais permissivo (é só leitura de metadados não sensíveis).
- **Autorização administrativa**: CRUD de `LdapConfig`/`LdapGroupMapping` e a fila de elevação restritos a `@Roles(ADMINISTRADOR)`, seguindo o padrão de `units-admin.controller.ts`.
- **Auditoria**: toda mudança em `LdapConfig`, `LdapGroupMapping`, e todo evento do ciclo de vida de `RoleElevationRequest` grava em `AuditLog` (reaproveita o modelo existente, sem schema novo).
- **Privilégio mínimo da conta de bind**: documentar (README/env.example) que a conta de serviço configurada em `bindDn` deve ter apenas permissão de leitura no AD.

## Endpoints novos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/login` | público (com throttle) | Contrato estendido com `unitId?` opcional |
| GET | `/auth/ldap-units` | público (com throttle) | Lista unidades com `ldapEnabled=true` para o popup de bootstrap |
| GET/POST | `/admin/units/:id/ldap-configs` | ADMINISTRADOR | CRUD de configs LDAP da unidade |
| PATCH/DELETE | `/admin/units/:id/ldap-configs/:configId` | ADMINISTRADOR | Atualizar/remover config |
| GET/POST | `/admin/units/:id/ldap-configs/:configId/group-mappings` | ADMINISTRADOR | CRUD de mapeamentos grupo→cargo |
| DELETE | `/admin/units/:id/ldap-configs/:configId/group-mappings/:mappingId` | ADMINISTRADOR | Remover mapeamento |
| GET | `/admin/elevation-requests` | ADMINISTRADOR | Listar solicitações (filtro por status) |
| POST | `/admin/elevation-requests/:id/approve` | ADMINISTRADOR | Aprovar elevação |
| POST | `/admin/elevation-requests/:id/reject` | ADMINISTRADOR | Rejeitar elevação |

## Biblioteca LDAP

`ldapts` (client LDAP TypeScript-nativo, promise-based, suporta StartTLS/LDAPS) — preferido a `ldapjs`/`passport-ldapauth`, que são mais antigos e callback-based.

## Testes

- Unitários: parsing de `DOMINIO\usuario`/`usuario@dominio`, escaping de filtro LDAP, prioridade de cargo no sync de grupos, cálculo de elevação (criação/revogação), criptografia/decriptação da bind password.
- Integração: fluxo completo de login LDAP mockando o client `ldapts` (bind sucesso/falha, busca de grupos, conta desabilitada), provisionamento de usuário novo, endpoints administrativos de CRUD e de elevação (com `RoleName.ADMINISTRADOR` guard).
- Cobertura mínima 80% nos módulos novos (`ldap/`, extensões de `auth/`), seguindo o padrão de specs existentes no projeto (`*.service.spec.ts`, `*.controller.spec.ts`).

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| DC indisponível trava o login | Timeout curto + lista de hosts para failover |
| Vazamento da senha de bind | Criptografia AES-256-GCM em repouso, nunca retornada em respostas |
| Escalação de privilégio via grupo do AD | Aprovador/Administrador sempre passam por aprovação manual, nunca automáticos |
| Enumeração de usuários via erro de login | Erro sempre genérico no fluxo LDAP, motivo real só em auditoria interna |
| Conflito de domínio entre configs | `domain` é `@unique` no schema — impede ambiguidade na resolução |
