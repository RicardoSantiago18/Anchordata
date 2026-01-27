#!/bin/bash
# Script de testes da API de Autenticação
# Use: bash test_api.sh

BASE_URL="http://localhost:5000"
ADMIN_TOKEN=""

echo "🧪 Testes da API de Autenticação"
echo "================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Teste 1: Login com admin
echo -e "${BLUE}1️⃣  Testando LOGIN com admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@anchordata.com",
    "password": "admin123456"
  }')

echo "$LOGIN_RESPONSE" | jq .
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}❌ Falha ao fazer login${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido!${NC}"
echo -e "Token: ${YELLOW}${ADMIN_TOKEN:0:30}...${NC}"
echo ""

# Teste 2: Obter dados do usuário atual
echo -e "${BLUE}2️⃣  Testando GET /api/users/me...${NC}"
curl -s -X GET "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
echo ""

# Teste 3: Listar todos os usuários
echo -e "${BLUE}3️⃣  Testando GET /api/users (listar todos)...${NC}"
curl -s -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
echo ""

# Teste 4: Criar novo usuário
echo -e "${BLUE}4️⃣  Testando POST /api/users (criar novo usuário)...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.usuario@anchordata.com",
    "name": "Novo Usuário",
    "password": "senha123456",
    "role": "engenheiro"
  }')

echo "$CREATE_RESPONSE" | jq .
NEW_USER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.user.id // empty')
echo ""

# Teste 5: Obter usuário específico
if [ ! -z "$NEW_USER_ID" ]; then
  echo -e "${BLUE}5️⃣  Testando GET /api/users/<id>...${NC}"
  curl -s -X GET "$BASE_URL/api/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
fi

# Teste 6: Atualizar usuário
if [ ! -z "$NEW_USER_ID" ]; then
  echo -e "${BLUE}6️⃣  Testando PUT /api/users/<id>...${NC}"
  curl -s -X PUT "$BASE_URL/api/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Usuário Atualizado",
      "role": "gerente"
    }' | jq .
  echo ""
fi

# Teste 7: Login com novo usuário
echo -e "${BLUE}7️⃣  Testando LOGIN com novo usuário...${NC}"
USER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.usuario@anchordata.com",
    "password": "senha123456"
  }')

echo "$USER_LOGIN" | jq .
USER_TOKEN=$(echo "$USER_LOGIN" | jq -r '.token // empty')
echo ""

# Teste 8: Tentar acessar rota protegida com token de usuário comum
echo -e "${BLUE}8️⃣  Testando acesso negado (usuário comum em rota admin)...${NC}"
echo "Tentando listar usuários com token de engenheiro:"
curl -s -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
echo ""

# Teste 9: Alterar senha
echo -e "${BLUE}9️⃣  Testando POST /api/users/change-password...${NC}"
curl -s -X POST "$BASE_URL/api/users/change-password" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "senha123456",
    "new_password": "nova.senha123"
  }' | jq .
echo ""

# Teste 10: Logout
echo -e "${BLUE}🔟 Testando POST /api/auth/logout...${NC}"
curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
echo ""

# Teste 11: Tentar usar token após logout (não funciona porque logout é frontend)
echo -e "${BLUE}1️⃣1️⃣  Testando token expirado...${NC}"
echo "Gerando token inválido:"
curl -s -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer invalid_token_123" | jq .
echo ""

# Teste 12: Tentar acessar sem token
echo -e "${BLUE}1️⃣2️⃣  Testando acesso sem token...${NC}"
curl -s -X GET "$BASE_URL/api/users" | jq .
echo ""

# Teste 13: Deletar usuário
if [ ! -z "$NEW_USER_ID" ]; then
  echo -e "${BLUE}1️⃣3️⃣  Testando DELETE /api/users/<id>...${NC}"
  curl -s -X DELETE "$BASE_URL/api/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
  echo ""
fi

echo -e "${GREEN}✅ Testes concluídos!${NC}"
