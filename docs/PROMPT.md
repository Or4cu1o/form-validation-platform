### **Especificação de Requisitos: Plataforma de Governança e Automação de Indicadores de TI (Plataforma FormOps)**

#### **1. Visão Geral e Objetivo Operacional**

O projeto visa digitalizar, centralizar e auditar o processo de confecção do Relatório Operacional de TI das unidades geradas, extinguindo o modelo legado baseado em documentos `.docx` manuais e capturas de tela descentralizadas. A solução unifica o fluxo em uma plataforma web governada por prazos rígidos, trilhas de auditoria e segmentação de formulários por complexidade da unidade (Níveis A, B e C), preparando os dados para consumo analítico via Tableau (Pipeline ELT).

O projeto adota uma estratégia de evolução contínua dividida em duas etapas sequenciais e retrocompatíveis:

* **Etapa 1 (Plataforma Web Assistida e Governança No-Code):** Entrega do portal corporativo web, motor de cálculo dinâmico, engine de formulários dinâmicos para a administração, controle de acesso estrito (RBAC) e persistência em banco relacional.
* **Etapa 2 (Automação Integral via APIs - API-Driven):** Acoplamento de scripts de extração e webhooks para coleta 100% autônoma de indicadores automatizáveis a partir de ferramentas especialistas (Zabbix, Grafana, GLPI e Bitdefender GravityZone), preenchendo os relatórios em modo rascunho (*Draft*) e isolando a edição humana apenas para contingências.

---

#### **2. Conceitos Centrais de Arquitetura**

* **Estado Residente (Persistência Estática):** Dados estruturais estáveis (como o inventário de servidores físicos, ativos de rede, links de internet contratados e licenças) são cadastrados uma única vez. Na virada do mês, o sistema clona automaticamente o estado do período anterior, exigindo que o analista valide apenas modificações, mitigando esquecimentos e retrabalho.


* **Validação Ativa e Contraprova:** Substituição da consolidação manual em planilhas Excel por um fluxo integrado onde a Matriz executa a contraprova indicador por indicador diretamente no sistema, inserindo pareceres técnicos e flags de conformidade individuais.

---

#### **3. Controle de Acesso Baseado em Funções (RBAC) e Escopo**

Cada usuário está estritamente associado a uma **Role** e a uma **Unidade** (identificada por Sigla, Nome, Logotipo PNG e Nível do Relatório A, B ou C).

* **Observador:** Permissão exclusiva de leitura e consulta aos relatórios históricos e atuais da sua unidade e de filiais explicitamente permitidas.
* **Elaborador:** Analista de infraestrutura/TI local responsável pelo preenchimento das variáveis voláteis e evidências da sua respectiva unidade.
* **Revisor:** Superior técnico imediato da unidade (Supervisor/Coordenador). Valida, edita e responde solidariamente pelos dados locais enviados à Matriz.
* **Aprovador:** Analista técnico da Matriz responsável por auditar, aplicar contraprovas, aprovar ou reprovar os indicadores de todas as unidades da organização.
* **Administrador:** Acesso irrestrito ao sistema. Gestor de roles, usuários, unidades e modificador do motor de formulários (*Engine No-Code*).

---

#### **4. Fluxo de Processo e Prazos Operacionais (SLA Motor)**

O ciclo de vida do relatório é mensal e governado por uma Engine de Cron calibrada em **Dias Úteis (DU)**, desconsiderando finais de semana e feriados:

1. **Abertura do Período (1º Dia Útil do Mês):** O sistema executa o Cron de inicialização, gera a instância do relatório com status `Pendente`, injeta o *Estado Residente* do mês anterior e abre a fase de **Elaboração**.
2. **Fase de Elaboração (Até o 6º DU):** O *Elaborador* insere os dados. Ao submeter, o status muda para `Em Revisão`.
3. **Fase de Revisão (Até o 8º DU):** O *Revisor* avalia os dados da unidade. Ele pode editar os valores diretamente. Ao submeter, o status muda para `Pendente de Aprovação`.
4. **Fase de Aprovação (Do 9º ao 10º DU):** O *Aprovador* da Matriz realiza a validação ativa.
* **Se Aprovado:** O status muda para `Concluído`. Os dados são travados para escrita e ficam expostos e visados na camada de staging para o processo de **ELT do Tableau**.
* **Se Reprovado:** O status retorna para `Em Revisão`. O formulário é reaberto para edição colaborativa entre *Revisor* e *Elaborador* na mesma unidade. O sistema concede um prazo adicional automático de **até 2 dias úteis** para a nova submissão. Não há fluxo de sub-devolução; a responsabilidade da correção é da unidade.



---

#### **5. Mapeamento de Ambientes da Plataforma**

* **Painel Central (Dashboard de Controle):** Tela inicial que exibe o histórico de relatórios passados e atuais da unidade do usuário. Dispõe de filtros avançados (por unidade, período de referência, status do fluxo), ordenação cronológica/por status, campo de busca global e um botão de exportação rápida na linha de cada relatório.
* **Área de Elaboração e Revisão Colaborativa:** Interface de preenchimento dinâmico onde o *Elaborador* e o *Revisor* inserem os dados do período e realizam o upload de evidências.
* **Mesa de Validação Técnica (Visão do Aprovador):** Painel gerencial listando todas as unidades e seus respectivos status de progresso (`Pendente`, `Em Andamento` / `Em Revisão`, `Concluído`). Ao abrir um relatório:
* Cada indicador exibe botões individuais para conferência de conformidade.
* Ao clicar em aprovar ou reprovar um indicador, abre-se uma janela modal de texto pequena obrigatória para inserção de justificativa técnico-operacional, acompanhada de um botão opcional para upload de imagem (evidência da contraprova realizada pela Matriz).


* **Área Administrativa de Controle de Acesso:** Interface para gestão de usuários (Matrícula, Nome, Sobrenome, E-mail, Role e Unidades) e Unidades (Sigla, Nome, Logo, Formulário Associado). **Regra Crítica de Persistência:** É proibida a exclusão física (`DELETE`) de entidades; o desligamento de pessoal ou fechamento de filiais opera estritamente via Soft Delete (`is_active = false`) para manter a integridade referencial histórica.
* **Área Administrativa de Governança de Estrutura (Engine No-Code):** Construtor visual de formulários baseado em metadados. Permite ao Administrador criar, inativar ou modificar formulários, tópicos e indicadores de forma retrocompatível. Em cada indicador, define-se: título, objetivo, chaves de input de variáveis (*keys* para recebimento de *values*), fórmula matemática dinâmica associada (ex: `(Key_A / (Key_B + Key_A)) * 100`), operador lógico da meta (ex: `>=`, `<=`, `==`) e o valor nominal da meta. Modificações refletem-se nos relatórios futuros e atualizam as metas globalmente para o Tableau ponderar o histórico com o estado atual.



---

#### **6. Funções Sistêmicas Intermediárias**

* **Trilha de Auditoria Contínua (`Audit Trail` via Trigger):** Monitoramento em nível de banco de dados. Toda modificação de valor, upload de nova evidência ou alteração no Estado Residente efetuada gera um registro imutável contendo: *ID do Registro, Usuário Autor da Alteração, Valor/Link Anterior, Valor/Link Novo e Timestamp exato*.
* **Mensageria Transacional Azure (Microsoft Workspace):** Disparo automatizado de e-mails via API de comunicação da Azure notificando os stakeholders sobre transições de status do fluxo (Avisos de: relatório disponível para revisão, pendente de aprovação, reprovado pela matriz ou concluído) e alertas de estouro de SLA (disparado no 5º DU para relatórios ainda não submetidos).
* **Motor de Exportação de Conformidade:** Geração de arquivos estruturados (PDF, CSV ou JSON). O documento gerado deve espelhar o relatório mantendo internamente as flags de status de validação de cada indicador (`Aprovado`, `Reprovado`, `Pendente de Validação`, `Em Revisão`). O rodapé do arquivo impresso deve conter o veredito final do relatório e a assinatura eletrônica do Aprovador responsável da Matriz (Nome, Cargo e Unidade), o padrão de nomenclatura poderar ser editado via interface administrativa, porem como padrão do sistema seguiremos "Relatório Operacional de Tecnologia da Informação - {SIGLA UNIDADE} - {data iso}".

---



#### 7. Diretrizes de Engenharia, Infraestrutura e Inicialização (Foco em Automação via Claude Code)

##### 1. Containerização e Gerenciamento de Ambiente (Docker & `.env`)

* **Isolamento de Infraestrutura:** O projeto deve ser totalmente containerizado utilizando **Docker** e orquestrado via **Docker Compose**, separando rigorosamente a camada da aplicação (API/Frontend) do banco de dados relacional (PostgreSQL) e do Object Storage de evidências.
* **Centralização de Configuração:** Todas as variáveis de ambiente devem ser mapeadas em um arquivo padrão `.env.example`. O sistema lerá obrigatoriamente desse arquivo as strings de conexão do banco de dados (host, porta, usuário, senha, database), credenciais do servidor de e-mail da Azure e os parâmetros de provisionamento do **Admin Inicial** (e-mail, matrícula e senha do primeiro superusuário em ambiente de produção).

##### 2. Estratégia de Deploy e Migrações de Banco de Dados

* **Pipelines de Produção:** A arquitetura deve ser projetada prevendo cenários de integração e deploy contínuos (CI/CD) em produção.
* **Automação de Schema:** O ciclo de inicialização do container da aplicação em produção deve conter um passo de verificação que executa de forma **100% automatizada** as migrações (*migrations*) pendentes no banco de dados. É terminantemente proibida a dependência de comandos manuais via terminal no servidor para a criação ou atualização de schemas e enums.

##### 3. Provisionamento de Ambiente de Testes (Seeders de Desenvolvimento)

* **Massa de Dados Automatizada:** Em ambiente de desenvolvimento, o sistema disparará rotinas de *seed* automaticamente logo após a execução das migrations para estruturar o seguinte cenário de testes:
* Criação da unidade inicial padrão chamada **MATRIZ**.
* Criação de **um usuário de testes para cada uma das 5 Roles existentes** (`Observador`, `Elaborador`, `Revisor`, `Aprovador`, `Administrador`), garantindo que todos os 5 fiquem vinculados nativamente à unidade **MATRIZ** para permitir testes imediatos de login, workflow e validação de escopo de dados.

##### 4. Desacoplamento Open Source e Injeção de Templates Proprietários (N1 e N3)

* **Engenharia Reversa dos Documentos:** O repositório conterá um diretório na raiz chamado `./template-forms`, onde estará alocado os dois arquivos de especificação originais (`.docx` de N1 e N3). **Você deve realizar a leitura e análise detalhada da estrutura interna destes documentos** (extraindo as chaves, fórmulas e objetivos de cada indicador de Segurança, Infraestrutura e Governança) antes de conceber os métodos de validação matemática do sistema.

* **Modularidade Core vs. Organização:** O core da plataforma deve nascer totalmente genérico e limpo (preparado para distribuição *Open Source*), contendo apenas a engine de formulários vazia.
* **Scripts de Injeção Isolados:** Para atender ao cenário real da organização, as definições estruturais do formulário **N1** e **N3** devem ser codificadas em scripts de seed/carga separados e isolados do core da aplicação. Isso permite que:

* A aplicação seja distribuída ou inicializada em modo limpo (Open Source).
* Ao rodar o deploy na infraestrutura interna da empresa, um comando ou flag adicional execute estes scripts específicos, inserindo instantaneamente na tabela de metadados os formulários **N1** e **N3** completos (com variáveis, fórmulas textuais de porcentagem, regras lógicas e metas oficiais de governança do grupo).