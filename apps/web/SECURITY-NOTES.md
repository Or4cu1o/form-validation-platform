# Notas de Segurança — Frontend (apps/web)

Este documento registra decisões e riscos de segurança aceitos deliberadamente no
frontend, seguindo o mesmo padrão de transparência usado em `apps/api/SECURITY-NOTES.md`.

## 1. Armazenamento do token de acesso: sessionStorage, não localStorage

O JWT retornado por `POST /auth/login` é guardado em `sessionStorage`
(`src/lib/token-storage.ts`), não em `localStorage` e não em cookie.

**Tradeoff avaliado:**

- A API é stateless (Bearer JWT no header `Authorization`, sem cookie de sessão),
  então não há CSRF a mitigar — o vetor relevante aqui é XSS.
- `sessionStorage` é acessível a qualquer script que rode no mesmo `origin`,
  exatamente como `localStorage` — nenhum dos dois é seguro contra um XSS já
  bem-sucedido. A diferença prática é a **janela de exposição**: um token em
  `sessionStorage` desaparece ao fechar a aba/janela, enquanto um token em
  `localStorage` persiste indefinidamente (dias/semanas) até logout explícito.
- A alternativa mais segura contra XSS — cookie `httpOnly` — exigiria o backend
  emitir o JWT via `Set-Cookie` e adicionar proteção CSRF (`SameSite`, double-submit
  token), o que é uma mudança de design do backend fora do escopo desta etapa
  (a API já está em produção com o padrão Bearer/JWT stateless).
- Dado o design existente do backend, `sessionStorage` é o compromisso prático:
  reduz a janela de exposição em caso de XSS sem exigir reescrever o esquema de
  autenticação da API.

**Mitigação complementar:** nenhum ponto do frontend usa `dangerouslySetInnerHTML`,
`eval`, ou insere HTML não sanitizado — confirmado por varredura de código nesta
revisão (ver seção 4). O risco de XSS residual vem de bibliotecas de terceiros
(auditado via `npm audit`, seção 3) ou de uma regressão futura que introduza
renderização de HTML não confiável sem sanitização.

**Recomendação futura (fora do escopo desta etapa):** migrar para cookie `httpOnly`
+ `SameSite=Strict` se/quando o backend adotar sessão baseada em cookie.

## 2. RBAC no frontend é apenas UX — a autorização real é sempre no backend

Toda gate de rota (`ProtectedRoute`) e toda ocultação condicional de botão/ação no
frontend existe **apenas para a experiência do usuário** (evitar mostrar ações que
vão falhar). A autorização de fato é sempre re-verificada pelo backend em cada
requisição:

- Guards de role (`@Roles(...)`) e o util `assertCanEditReportData` no backend
  são a única fonte de verdade sobre quem pode editar/validar/finalizar.
- `UnitAccessService` escopa os dados retornados por unidade no servidor —
  o frontend nunca decide sozinho quais relatórios um usuário pode ver.
- Confirmado nesta etapa: mesmo que o frontend erroneamente tentasse chamar um
  endpoint fora do escopo do usuário (ver seção 5), o backend rejeitaria com
  403/404 independentemente do que a UI mostrar ou permitir clicar.

## 3. Vulnerabilidades de dependências (npm audit)

Estado em 2026-07-14, após atualizar `vitest`/`@vitest/coverage-v8` de 2.1.x para
3.2.7 (necessário para compatibilidade de tipos com Vite 6) e rodar
`npm audit fix` (resolveu 6 dos 8 achados originais sem breaking changes):

| Pacote | Severidade | Via | Escopo |
|---|---|---|---|
| `glob` 10.2.0–10.4.5 | HIGH | `@vitest/coverage-v8` → `test-exclude` | devDependency, só roda em `vitest --coverage` local/CI |
| `picomatch` 4.0.0–4.0.3 | HIGH | `vite` → `fdir` | devDependency, só roda no dev server / build do Vite |

**Por que o risco é aceito sem correção forçada:**

- Ambos são ferramentas de build/teste que rodam apenas no ambiente do
  desenvolvedor/CI (Node.js), nunca são importados pelo código-fonte da aplicação
  e nunca chegam ao bundle de produção (`dist/`) servido ao usuário final.
- A correção completa exigiria `npm audit fix --force`, que baixaria a versão do
  `vite`/`vitest` para uma faixa mais antiga (breaking change), reintroduzindo o
  problema original de incompatibilidade de tipos que motivou o upgrade para
  vitest 3.x nesta mesma sessão.
- Reavaliar a cada bump de `vite`/`vitest`.

## 4. Varredura de padrões de risco (XSS, injeção, exposição)

Verificado por grep em todo `src/` nesta revisão:

- `dangerouslySetInnerHTML`: nenhuma ocorrência.
- `eval(` / `new Function(`: nenhuma ocorrência.
- `console.log`/`console.debug`: nenhuma ocorrência (bloqueado por ESLint
  `no-console: warn`).
- `window.open`: 2 ocorrências (`IndicatorResponseCard.tsx`,
  `ValidationIndicatorCard.tsx`), ambas com `noopener,noreferrer` — sem
  exposição de `window.opener` à página de destino.
- `localStorage`: nenhuma ocorrência de uso real (só referenciado no comentário
  de `token-storage.ts` e no teste que confirma que **não** é usado).
- Nenhum `<a target="_blank">` sem `rel` — todas as janelas externas usam
  `window.open` com `rel` equivalente.

## 5. Path segments de URL sem encoding (corrigido nesta revisão)

**Achado:** todos os módulos em `src/api/*.ts` interpolavam parâmetros de rota
(`id`, `templateId`, `topicId`, `indicatorResponseId`, `validationRecordId`)
diretamente em template literals sem `encodeURIComponent`. Alguns desses valores
vêm de `useParams()` (a URL do navegador), portanto são controláveis pelo
usuário — ex.: `id = "../admin/units"` produziria uma URL de fetch que o
parser de URL do navegador normalizaria removendo o `../`, potencialmente
direcionando a requisição para um endpoint diferente do pretendido pela tela.

**Severidade:** baixa/defesa-em-profundidade, não uma bypass de autorização —
o backend re-valida role e escopo de unidade em toda rota independentemente do
path que o frontend tentar montar (ver seção 2), então o pior cenário é uma
requisição malformada rejeitada com 403/404 pelo backend.

**Correção aplicada:** todo parâmetro de path em `src/api/*.ts` agora passa por
`encodeURIComponent(...)` antes de entrar no template literal. Teste de
regressão adicionado em `src/api/reports.test.ts` (`percent-encodes an id
containing path-traversal characters`).

## 6. Upload de evidências: whitelist de MIME espelhada, tamanho não validado no cliente

O atributo `accept` dos `<input type="file">` (`.pdf,.png,.jpg,.jpeg,.webp`) espelha
exatamente a whitelist de MIME do backend (`evidence-upload.constants.ts`). Isso é
apenas UX — a enforcement real é o `fileFilter` do Multer no backend, que já foi
endurecido em uma revisão de segurança anterior (achado HIGH documentado em
`apps/api/SECURITY-NOTES.md`).

**Gap identificado, não corrigido nesta etapa (severidade informativa):** o
frontend não valida o tamanho do arquivo (limite de 10 MB) antes de enviar —
um arquivo maior é enviado e só então rejeitado pelo backend, desperdiçando
banda. Não é um risco de segurança (o backend segue sendo a autoridade), apenas
uma melhoria de UX pendente.

## 7. Cabeçalhos de segurança HTTP (CSP, HSTS, etc.)

Fora do escopo do código do frontend: como esta é uma SPA servida como arquivos
estáticos (`vite build` → `dist/`), cabeçalhos como `Content-Security-Policy`,
`Strict-Transport-Security` e `X-Frame-Options` devem ser configurados na camada
de hospedagem/reverse proxy (nginx, CDN, etc.), não no código React. Ver
`rules/ecc/web/security.md` para a política de CSP recomendada — deve ser
aplicada no momento do deploy.

## 8. Segredos no bundle

`src/lib/env.ts` só lê `VITE_API_URL` (endereço da API, não sensível). Nenhuma
chave, senha ou token está hardcoded no código-fonte. Toda variável `VITE_*` é
pública por design do Vite — nunca colocar segredos reais nesse prefixo.
