#!/bin/bash

# Cores para mensagens de feedback
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

# Desativar a limpeza de tela do CLI do Vite de forma global
export VITE_CLI_CONFIG_CLEAR_SCREEN=false

# Habilitar saída imediata se algum comando falhar de forma inesperada
set -e

# Variável para rastrear a etapa atual (útil para relatar erros detalhados)
CURRENT_STEP="Inicialização do Script"

# Variáveis globais para rastreamento de processos e infraestrutura
API_PID=""
WEB_PID=""
DOCKER_STARTED=false
DOCKER_COMPOSE_CMD=""
PID_FILE=".rtio.pid"
LOGS_DIR="logs"

# Função para verificar se um comando está disponível no sistema
check_command() {
    if command -v "$1" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Mostrar status do aplicativo
status_app() {
    if [ -f "$PID_FILE" ]; then
        # Carregar PIDs salvos
        source "$PID_FILE"
        API_RUNNING=false
        WEB_RUNNING=false
        
        if [ -n "$SAVED_API_PID" ] && kill -0 "$SAVED_API_PID" 2>/dev/null; then
            API_RUNNING=true
        fi
        if [ -n "$SAVED_WEB_PID" ] && kill -0 "$SAVED_WEB_PID" 2>/dev/null; then
            WEB_RUNNING=true
        fi
        
        echo -e "${BLUE}======================================================================${NC}"
        echo -e "${BLUE}                     Status do RTIO (Background)                      ${NC}"
        echo -e "${BLUE}======================================================================${NC}"
        echo -e "API Backend (PID $SAVED_API_PID): $([ "$API_RUNNING" = true ] && echo -e "${GREEN}ONLINE${NC}" || echo -e "${RED}OFFLINE (Crashed / Stopped)${NC}")"
        echo -e "Web Frontend (PID $SAVED_WEB_PID): $([ "$WEB_RUNNING" = true ] && echo -e "${GREEN}ONLINE${NC}" || echo -e "${RED}OFFLINE (Crashed / Stopped)${NC}")"
        
        # Verificar status dos containers Docker
        if docker compose version &>/dev/null; then
            echo -e "\n${BLUE}Status dos containers Docker (docker compose):${NC}"
            docker compose ps
        elif check_command docker-compose; then
            echo -e "\n${BLUE}Status dos containers Docker (docker-compose):${NC}"
            docker-compose ps
        fi
        echo -e "----------------------------------------------------------------------"
        echo -e "Logs disponíveis em:"
        echo -e "  - Backend:  tail -n 50 logs/api.log"
        echo -e "  - Frontend: tail -n 50 logs/web.log"
        echo -e "======================================================================\n"
    else
        echo -e "${YELLOW}Nenhum arquivo de processo ativo encontrado ($PID_FILE).${NC}"
        # Mesmo assim mostra se tem containers rodando
        if docker compose version &>/dev/null; then
            echo -e "\n${BLUE}Status dos containers Docker (docker compose):${NC}"
            docker compose ps
        elif check_command docker-compose; then
            echo -e "\n${BLUE}Status dos containers Docker (docker-compose):${NC}"
            docker-compose ps
        fi
    fi
    exit 0
}

# Parar os processos locais da aplicação (Backend NestJS e Frontend Vite)
stop_app() {
    echo -e "${YELLOW}Parando processos locais da aplicação RTIO (Backend e Frontend)...${NC}"

    # Função auxiliar: mata um processo e todo o seu grupo de processos
    kill_proc_group() {
        local pid="$1" label="$2"
        if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then return; fi
        echo "Parando ${label} (PID: $pid)..."
        # Tenta matar o grupo inteiro (processos filhos incluídos)
        local pgid
        pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')
        if [ -n "$pgid" ] && [ "$pgid" != "0" ]; then
            kill -- -"$pgid" 2>/dev/null || kill "$pid" 2>/dev/null || true
        else
            kill "$pid" 2>/dev/null || true
        fi
        # Aguarda até 5s para o processo terminar
        local i=0
        while kill -0 "$pid" 2>/dev/null && [ $i -lt 10 ]; do sleep 0.5; i=$((i+1)); done
        # Se ainda estiver vivo, força com SIGKILL
        if kill -0 "$pid" 2>/dev/null; then
            kill -9 "$pid" 2>/dev/null || true
            [ -n "$pgid" ] && kill -9 -- -"$pgid" 2>/dev/null || true
        fi
    }

    if [ -f "$PID_FILE" ]; then
        source "$PID_FILE"
        kill_proc_group "$SAVED_API_PID" "Backend API"
        kill_proc_group "$SAVED_WEB_PID" "Frontend Web"
        rm -f "$PID_FILE"
    else
        echo -e "${YELLOW}Aviso: Nenhum processo RTIO ativo registrado em $PID_FILE para parar.${NC}"
    fi

    # Garantia extra: matar qualquer processo node/vite/nest nas portas da aplicação,
    # sem matar o próprio script ($$) nem o grupo de processos do script (BASHPID).
    _kill_port_pids() {
        local port="$1"
        if ! command -v fuser &>/dev/null; then return; fi
        local pids
        pids=$(fuser "${port}/tcp" 2>/dev/null | tr ' ' '\n' | grep -v "^$$\$" | grep -v "^$BASHPID\$" | grep -v '^$') || true
        for p in $pids; do
            # Matar apenas processos node (vite/nest/api)
            local cmd
            cmd=$(ps -o comm= -p "$p" 2>/dev/null) || continue
            if echo "$cmd" | grep -qiE "node|vite"; then
                echo "Matando processo $p ($cmd) na porta $port..."
                kill -9 "$p" 2>/dev/null || true
            fi
        done
    }
    _kill_port_pids "${API_PORT:-7444}"
    _kill_port_pids "${WEB_PORT:-7443}"

    echo -e "${GREEN}✓ Processos locais finalizados.${NC}"
}

# Parar todos os serviços, incluindo containers Docker
down_app() {
    # 1. Parar processos locais primeiro
    stop_app
    
    # 2. Derrubar Docker Compose
    if docker compose version &>/dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif check_command docker-compose; then
        DOCKER_COMPOSE_CMD="docker-compose"
    fi
    
    if [ -n "$DOCKER_COMPOSE_CMD" ]; then
        echo "Derrubando infraestrutura Docker ($DOCKER_COMPOSE_CMD down)..."
        $DOCKER_COMPOSE_CMD down || true
    fi
    
    echo -e "${GREEN}✓ Todos os serviços e containers foram removidos!${NC}"
    exit 0
}

# Verificar argumentos do CLI
ACTION="${1:-start}"
case "$ACTION" in
    start)
        # Prossegue com a inicialização normal
        ;;
    stop)
        stop_app
        exit 0
        ;;
    down)
        down_app
        exit 0
        ;;
    status)
        status_app
        ;;
    restart)
        echo -e "${BLUE}=== Reiniciando a aplicação RTIO ===${NC}"
        stop_app
        # prossegue para a inicialização normal
        ;;
    *)
        echo -e "${RED}Uso: $0 [start|stop|down|status|restart]${NC}"
        exit 1
        ;;
esac

# Criar pasta de logs se não existir
mkdir -p "$LOGS_DIR"

# Função de encerramento em caso de interrupção abrupta durante a inicialização (Ctrl+C antes de terminar)
cleanup() {
    # Desativa traps para evitar recursão
    trap - SIGINT SIGTERM EXIT ERR
    
    echo -e "\n${YELLOW}Interrupção detectada. Encerrando processos da inicialização...${NC}"
    if [ -n "$API_PID" ]; then
        kill "$API_PID" 2>/dev/null || true
    fi
    if [ -n "$WEB_PID" ]; then
        kill "$WEB_PID" 2>/dev/null || true
    fi
    
    if [ "$DOCKER_STARTED" = true ] && [ -n "$DOCKER_COMPOSE_CMD" ]; then
        echo -e "${YELLOW}Derrubando infraestrutura Docker ($DOCKER_COMPOSE_CMD down)...${NC}"
        $DOCKER_COMPOSE_CMD down || true
    fi
    
    echo -e "${GREEN}Processos encerrados. Até mais!${NC}"
    exit 0
}

# Função de limpeza emergencial quando ocorre um erro durante a inicialização
cleanup_on_error() {
    # Desativa traps para evitar loops
    trap - SIGINT SIGTERM EXIT ERR
    
    echo -e "\n${YELLOW}[Limpeza Emergencial] Finalizando qualquer serviço ativo...${NC}"
    if [ -n "$API_PID" ]; then
        echo "Finalizando processo do Backend API (PID: $API_PID)..."
        kill -9 "$API_PID" 2>/dev/null || true
    fi
    if [ -n "$WEB_PID" ]; then
        echo "Finalizando processo do Frontend Web (PID: $WEB_PID)..."
        kill -9 "$WEB_PID" 2>/dev/null || true
    fi
    
    if [ "$DOCKER_STARTED" = true ] && [ -n "$DOCKER_COMPOSE_CMD" ]; then
        echo "Derrubando containers Docker de suporte..."
        $DOCKER_COMPOSE_CMD down || true
    fi
    
    # Remover arquivo de PID parcial se existir
    rm -f "$PID_FILE"
    
    echo -e "${GREEN}Limpeza emergencial concluída com sucesso.${NC}"
}

# Manipulador de erros inesperados (Gera relatório e executa limpeza)
error_handler() {
    local lineno="$1"
    local exit_code="${2:-1}"
    
    echo -e "\n${RED}======================================================================${NC}"
    echo -e "${RED}❌ ERRO INESPERADO DETECTADO DURANTE A INICIALIZAÇÃO!${NC}"
    echo -e "${RED}======================================================================${NC}"
    echo -e "Etapa que falhou: ${YELLOW}$CURRENT_STEP${NC}"
    echo -e "Linha do Script:  ${YELLOW}$lineno${NC}"
    echo -e "Código de Saída:  ${YELLOW}$exit_code${NC}"
    echo -e "----------------------------------------------------------------------"
    echo -e "Exibindo últimas 10 linhas de log da API (logs/api.log) se disponível:"
    tail -n 10 "$LOGS_DIR/api.log" 2>/dev/null || echo "(Log indisponível)"
    echo -e "----------------------------------------------------------------------"
    echo -e "Exibindo últimas 10 linhas de log do Frontend (logs/web.log) se disponível:"
    tail -n 10 "$LOGS_DIR/web.log" 2>/dev/null || echo "(Log indisponível)"
    echo -e "----------------------------------------------------------------------"
    echo -e "O script foi interrompido para evitar que processos fiquem rodando com erros."
    
    cleanup_on_error
    exit "$exit_code"
}

# Traps para encerramento do usuário e erros de comandos durante o startup
trap cleanup SIGINT SIGTERM EXIT
trap 'error_handler ${LINENO} $?' ERR

# 1. Validação de Pré-requisitos
CURRENT_STEP="Validação de pré-requisitos no ambiente"
echo -e "\n${BLUE}[1/5] Verificando pré-requisitos no ambiente...${NC}"

INSTALL_NODE=false
INSTALL_NPM=false
INSTALL_DOCKER=false
INSTALL_COMPOSE=false

# Verificar Node.js
if check_command node; then
    NODE_VERSION=$(node -v | tr -d 'v')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo -e "${GREEN}✓ Node.js detectado (v$NODE_VERSION)${NC}"
    else
        echo -e "${YELLOW}⚠ Node.js detectado (v$NODE_VERSION), mas é necessária a versão 20 ou superior.${NC}"
        INSTALL_NODE=true
    fi
else
    echo -e "${YELLOW}⚠ Node.js não encontrado.${NC}"
    INSTALL_NODE=true
fi

# Verificar npm
if check_command npm; then
    echo -e "${GREEN}✓ npm detectado ($(npm -v))${NC}"
else
    echo -e "${YELLOW}⚠ npm não encontrado.${NC}"
    INSTALL_NPM=true
fi

# Verificar Docker
if check_command docker; then
    echo -e "${GREEN}✓ Docker detectado ($(docker -v))${NC}"
else
    echo -e "${YELLOW}⚠ Docker não encontrado.${NC}"
    INSTALL_DOCKER=true
fi

# Verificar Docker Compose
if docker compose version &>/dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo -e "${GREEN}✓ Docker Compose V2 detectado ($($DOCKER_COMPOSE_CMD version))${NC}"
elif check_command docker-compose; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo -e "${GREEN}✓ Docker Compose V1 detectado ($($DOCKER_COMPOSE_CMD -v))${NC}"
else
    echo -e "${YELLOW}⚠ Docker Compose não encontrado.${NC}"
    INSTALL_COMPOSE=true
fi

# 2. Instalação das dependências ausentes
CURRENT_STEP="Instalação automática de pré-requisitos ausentes"
echo -e "\n${BLUE}[2/5] Instalando pré-requisitos ausentes...${NC}"

if [ "$INSTALL_NODE" = true ] || [ "$INSTALL_NPM" = true ] || [ "$INSTALL_DOCKER" = true ] || [ "$INSTALL_COMPOSE" = true ]; then
    # Verificar se temos apt-get para tentar instalar automaticamente (Debian/Ubuntu/Linux Mint)
    if check_command apt-get; then
        echo -e "${YELLOW}Gerenciador apt-get detectado. Se solicitado, digite a senha para instalar as dependências...${NC}"
        
        # Atualizar repositórios
        echo "Atualizando lista de pacotes..."
        sudo apt-get update -y
        
        # Instalar Node.js v20 e npm se necessário
        if [ "$INSTALL_NODE" = true ] || [ "$INSTALL_NPM" = true ]; then
            echo "Adicionando repositório NodeSource para Node.js v20..."
            sudo apt-get install -y curl ca-certificates gnupg
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
            echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
            sudo apt-get update -y
            echo "Instalando Node.js e npm..."
            sudo apt-get install -y nodejs
        fi
        
        # Instalar Docker se necessário
        if [ "$INSTALL_DOCKER" = true ]; then
            echo "Instalando Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            rm get-docker.sh
            sudo systemctl enable --now docker || true
            sudo usermod -aG docker "$USER" || true
            echo -e "${YELLOW}Docker instalado. Você pode precisar reiniciar sua sessão para usar o docker sem sudo.${NC}"
        fi
        
        # Instalar Docker Compose se necessário
        if [ "$INSTALL_COMPOSE" = true ]; then
            echo "Instalando Docker Compose..."
            sudo apt-get install -y docker-compose-plugin || sudo apt-get install -y docker-compose
            if docker compose version &>/dev/null; then
                DOCKER_COMPOSE_CMD="docker compose"
            else
                DOCKER_COMPOSE_CMD="docker-compose"
            fi
        fi
        
        echo -e "${GREEN}✓ Pré-requisitos instalados com sucesso!${NC}"
    else
        echo -e "${RED}Erro: Não foi possível realizar a instalação automática das seguintes dependências:${NC}"
        [ "$INSTALL_NODE" = true ] && echo "  - Node.js v20+"
        [ "$INSTALL_NPM" = true ] && echo "  - npm"
        [ "$INSTALL_DOCKER" = true ] && echo "  - Docker"
        [ "$INSTALL_COMPOSE" = true ] && echo "  - Docker Compose"
        echo -e "${YELLOW}Por favor, instale-as manualmente usando o gerenciador de pacotes do seu sistema e execute este script novamente.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Todos os pré-requisitos já estão instalados!${NC}"
fi

# Garantir que o daemon do Docker esteja ativo
if check_command docker; then
    if ! docker info &>/dev/null; then
        echo -e "${YELLOW}Docker Daemon não está em execução. Tentando iniciar o serviço via systemctl...${NC}"
        sudo systemctl start docker || echo -e "${RED}Não foi possível iniciar o daemon do Docker. Verifique se o serviço está ativo.${NC}"
    fi
fi

# 3. Configuração do ambiente (.env)
CURRENT_STEP="Configuração do arquivo de ambiente (.env)"
echo -e "\n${BLUE}[3/5] Configurando o arquivo de ambiente (.env)...${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}Arquivo .env não encontrado. Copiando do template .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado a partir de .env.example.${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env já existe.${NC}"
fi

# Carregar e exportar variáveis de ambiente do .env para o script bash
echo "Carregando configurações de ambiente..."
while IFS= read -r line || [ -n "$line" ]; do
    # Ignorar comentários e linhas sem sinal de igual
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ "$line" =~ = ]]; then
        # Extrair chave e valor
        key=$(echo "$line" | cut -d= -f1 | xargs)
        val=$(echo "$line" | cut -d= -f2- | xargs)
        export "$key"="$val"
    fi
done < .env

# Definir valores padrão se não encontrados
NODE_ENV=${NODE_ENV:-development}
SEED_ON_START=${SEED_ON_START:-true}
SEED_PROPRIETARY_FORMS=${SEED_PROPRIETARY_FORMS:-false}

echo -e "Ambiente detectado: ${GREEN}NODE_ENV=${NODE_ENV}${NC}"

# Instalar dependências npm do monorepo
CURRENT_STEP="Instalação de dependências npm (npm install)"
echo "Instalando dependências do projeto (npm install)..."
npm install --ignore-scripts --no-audit

# 4. Inicialização da infraestrutura de apoio (PostgreSQL + MinIO)
CURRENT_STEP="Inicialização dos containers Docker"
echo -e "\n${BLUE}[4/5] Inicializando infraestrutura local (PostgreSQL + MinIO)...${NC}"

if [ -z "$DOCKER_COMPOSE_CMD" ]; then
    if docker compose version &>/dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif check_command docker-compose; then
        DOCKER_COMPOSE_CMD="docker-compose"
    fi
fi

DOCKER_OK=true
if [ -z "$DOCKER_COMPOSE_CMD" ]; then
    echo -e "${YELLOW}⚠ Docker Compose não está instalado. Pulando inicialização de containers e tentando conexão direta...${NC}"
    DOCKER_OK=false
elif ! docker info &>/dev/null; then
    echo -e "${YELLOW}⚠ Docker Daemon não está em execução ou o usuário atual não tem acesso. Pulando inicialização de containers...${NC}"
    DOCKER_OK=false
fi

if [ "$DOCKER_OK" = true ]; then
    echo "Subindo containers de suporte com $DOCKER_COMPOSE_CMD..."
    if ! $DOCKER_COMPOSE_CMD up -d postgres minio; then
        echo -e "${YELLOW}⚠ Falha ao subir containers via Docker Compose. Tentando prosseguir com conexões diretas como fallback...${NC}"
        DOCKER_OK=false
    else
        DOCKER_STARTED=true
    fi
fi

# Aguardar o banco de dados estar pronto para conexões
CURRENT_STEP="Conexão com banco de dados e aplicação de migrações Prisma"
echo -e "${YELLOW}Aguardando o banco de dados PostgreSQL iniciar e aceitar conexões...${NC}"
MAX_RETRIES=20
RETRY_COUNT=0
MIGRATED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma &>/dev/null; then
        echo -e "${GREEN}✓ Banco de dados pronto e migrações aplicadas!${NC}"
        MIGRATED=true
        break
    fi
    echo "Aguardando banco de dados... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$MIGRATED" != true ]; then
    echo -e "${RED}Erro: O banco de dados PostgreSQL não ficou pronto no tempo limite.${NC}"
    echo "Executando migração final para exibir o erro detalhado da conexão:"
    npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma || true
    echo "Verifique as configurações em seu arquivo .env e se os containers docker estão rodando."
    exit 1
fi

# Gerar o Prisma Client explicitamente
CURRENT_STEP="Geração do Prisma Client"
echo "Gerando Prisma Client..."
npm run prisma:generate --workspace=apps/api

# Executar Seed, se aplicável
CURRENT_STEP="Execução de seeds e inicialização do banco"
if [ "$SEED_ON_START" = "true" ] || [ "$NODE_ENV" = "development" ]; then
    echo "Executando carga de dados de seed..."
    npm run seed --workspace=apps/api
    
    if [ "$SEED_PROPRIETARY_FORMS" = "true" ]; then
        echo "Injetando formulários proprietários (N1 e N3)..."
        npm run seed:n1 --workspace=apps/api
        npm run seed:n3 --workspace=apps/api
    fi
fi

# 5. Execução da aplicação conforme NODE_ENV
CURRENT_STEP="Inicialização dos servidores da aplicação (Vite/NestJS)"
echo -e "\n${BLUE}[5/5] Iniciando os serviços da aplicação em background (${NODE_ENV})...${NC}"

if [ "$NODE_ENV" = "production" ]; then
    # Em produção: limpar dist, tsbuildinfo e fazer build completo antes de subir
    echo "Limpando builds e caches antigos do NestJS..."
    rm -rf apps/api/dist apps/api/tsconfig.tsbuildinfo
    echo "Executando build de produção..."
    npm run build
    
    echo "Iniciando backend (API NestJS) em produção (Redirecionando logs)..."
    npm run start --workspace=apps/api > "$LOGS_DIR/api.log" 2>&1 &
    API_PID=$!
    
    echo "Iniciando frontend (Preview Vite) na porta $WEB_PORT (Redirecionando logs)..."
    npm run preview --workspace=apps/web -- --port "$WEB_PORT" --host > "$LOGS_DIR/web.log" 2>&1 &
    WEB_PID=$!
else
    # Em dev: NÃO apagar o dist para preservar o cache incremental do TypeScript
    # O nest start --watch recompila apenas o que mudou, acelerando o startup
    echo "Iniciando backend (API NestJS) em modo dev (Redirecionando logs)..."
    npm run dev:api > "$LOGS_DIR/api.log" 2>&1 &
    API_PID=$!
    
    echo "Iniciando frontend (Vite) em modo dev (Redirecionando logs)..."
    npm run dev:web > "$LOGS_DIR/web.log" 2>&1 &
    WEB_PID=$!
fi

# 6. Validação de inicialização (Healthcheck via curl e docker compose ps)
CURRENT_STEP="Validação da integridade dos serviços e Healthcheck"
echo -e "\n${BLUE}Validando a inicialização da aplicação...${NC}"

# Esperar até ~80 segundos para o backend (NestJS precisa compilar o TS na 1ª vez)
# O nest start --watch compila antes de subir; dar tempo suficiente é essencial.
MAX_HEALTH_RETRIES=40
HEALTH_RETRY=0
HEALTH_OK=false

echo "Aguardando resposta do healthcheck da API (http://localhost:$API_PORT/health)..."
echo "(O NestJS precisa compilar o TypeScript antes de subir — aguarde até ~80s)"
# Pausa inicial de 10s para o nest iniciar a compilação antes de checar
sleep 10
while [ $HEALTH_RETRY -lt $MAX_HEALTH_RETRIES ]; do
    # Tenta obter status code 200 do healthcheck da API
    API_STATUS_CODE=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:$API_PORT/health" || echo "000")
    if [ "$API_STATUS_CODE" = "200" ]; then
        HEALTH_OK=true
        break
    fi
    # Verificar se os processos ainda estão rodando para não esperar à toa se tiverem crashed
    if ! kill -0 "$API_PID" 2>/dev/null; then
        echo -e "${RED}Erro: O processo da API backend (PID $API_PID) encerrou inesperadamente.${NC}"
        break
    fi
    echo "Aguardando API ficar online... ($((HEALTH_RETRY+1))/$MAX_HEALTH_RETRIES)"
    sleep 2
    HEALTH_RETRY=$((HEALTH_RETRY+1))
done

# Validar se o Frontend está ativo
WEB_OK=false
if [ "$HEALTH_OK" = true ]; then
    WEB_STATUS_CODE=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:$WEB_PORT" || echo "000")
    if [ "$WEB_STATUS_CODE" != "000" ]; then
        WEB_OK=true
    fi
fi

# Validar estado dos containers Docker se DOCKER_OK for true
if [ "$DOCKER_OK" = true ] && [ -n "$DOCKER_COMPOSE_CMD" ]; then
    echo -e "\n${BLUE}Verificando status dos containers Docker ($DOCKER_COMPOSE_CMD ps):${NC}"
    $DOCKER_COMPOSE_CMD ps
fi

# Imprimir Resumo de Sucesso ou Falha
if [ "$HEALTH_OK" = true ] && [ "$WEB_OK" = true ]; then
    # Desativar traps para que o exit normal do script não finalize a aplicação em background
    trap - SIGINT SIGTERM EXIT ERR
    
    # Salvar PIDs no arquivo
    echo "SAVED_API_PID=$API_PID" > "$PID_FILE"
    echo "SAVED_WEB_PID=$WEB_PID" >> "$PID_FILE"
    
    echo -e "\n${GREEN}======================================================================${NC}"
    echo -e "${GREEN}✓ APLICAÇÃO INICIADA E VALIDADA COM SUCESSO! (Modo Daemon/Background)${NC}"
    echo -e "${GREEN}======================================================================${NC}"
    echo -e "API Backend (NestJS): ${GREEN}ONLINE${NC} (http://localhost:$API_PORT/health)"
    echo -e "Web Frontend (Vite):  ${GREEN}ONLINE${NC} (http://localhost:$WEB_PORT)"
    if [ "$DOCKER_OK" = true ]; then
        echo -e "Containers de Suporte: ${GREEN}ATIVOS${NC}"
    else
        echo -e "Containers de Suporte: ${YELLOW}IGNORADOS / NÃO INICIADOS (Fallback Direct Connection)${NC}"
    fi
    echo -e "Logs do Backend:       ${BLUE}logs/api.log${NC}"
    echo -e "Logs do Frontend:      ${BLUE}logs/web.log${NC}"
    echo -e "----------------------------------------------------------------------"
    echo -e "Para ver os logs em tempo real:"
    echo -e "  - Backend:  tail -f logs/api.log"
    echo -e "  - Frontend: tail -f logs/web.log"
    echo -e "----------------------------------------------------------------------"
    echo -e "Para gerenciar a aplicação:"
    echo -e "  - Verificar status: ./setup-and-run.sh status"
    echo -e "  - Reiniciar:        ./setup-and-run.sh restart"
    echo -e "  - Parar aplicação:  ./setup-and-run.sh stop"
    echo -e "  - Parar tudo+banco: ./setup-and-run.sh down"
    echo -e "======================================================================${NC}"
    
    # Exibir credenciais de acesso
    echo -e "\n${BLUE}=== Credenciais de Acesso Disponíveis ===${NC}"
    echo -e "Administrador Inicial (provisionado via .env):"
    echo -e "  - Matrícula: ${GREEN}${INITIAL_ADMIN_MATRICULA:-00001}${NC}"
    echo -e "  - E-mail:    ${GREEN}${INITIAL_ADMIN_EMAIL:-admin@example.com}${NC}"
    echo -e "  - Senha:     ${GREEN}${INITIAL_ADMIN_PASSWORD:-change-me}${NC}"
    
    if [ "$NODE_ENV" != "production" ]; then
        echo -e "\nUsuários de Teste para Desenvolvimento (Senha padrão: ${GREEN}RtioTeste@2026${NC}):"
        echo -e "  - Observador:    email: ${GREEN}observador@matriz.dev${NC} | matricula: ${GREEN}10001${NC}"
        echo -e "  - Elaborador:    email: ${GREEN}elaborador@matriz.dev${NC} | matricula: ${GREEN}10002${NC}"
        echo -e "  - Revisor:       email: ${GREEN}revisor@matriz.dev${NC} | matricula: ${GREEN}10003${NC}"
        echo -e "  - Aprovador:     email: ${GREEN}aprovador@matriz.dev${NC} | matricula: ${GREEN}10004${NC}"
        echo -e "  - Administrador: email: ${GREEN}administrador@matriz.dev${NC} | matricula: ${GREEN}10005${NC}"
    fi
    echo -e "======================================================================\n"
    
    exit 0
else
    echo -e "\n${RED}======================================================================${NC}"
    echo -e "${RED}❌ FALHA NA INICIALIZAÇÃO DA APLICAÇÃO!${NC}"
    echo -e "${RED}======================================================================${NC}"
    echo -e "API Backend (NestJS): $([ "$HEALTH_OK" = true ] && echo -e "${GREEN}ONLINE${NC}" || echo -e "${RED}OFFLINE${NC}")"
    echo -e "Web Frontend (Vite):  $([ "$WEB_OK" = true ] && echo -e "${GREEN}ONLINE${NC}" || echo -e "${RED}OFFLINE${NC}")"
    echo -e "----------------------------------------------------------------------"
    echo -e "Exibindo as últimas 20 linhas de log do Backend (logs/api.log):"
    tail -n 20 "$LOGS_DIR/api.log" 2>/dev/null || true
    echo -e "----------------------------------------------------------------------"
    echo -e "Exibindo as últimas 20 linhas de log do Frontend (logs/web.log):"
    tail -n 20 "$LOGS_DIR/web.log" 2>/dev/null || true
    echo -e "----------------------------------------------------------------------"
    echo -e "Encerrando todos os serviços associados..."
    cleanup_on_error
    exit 1
fi
