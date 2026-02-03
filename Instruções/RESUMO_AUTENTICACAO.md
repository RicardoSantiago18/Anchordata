# 🔐 Sistema de Autenticação Implementado

## ✨ O que foi criado

### 1. **Modelo de Usuário Atualizado**
```python
# user_model.py
User(
  id: int (Primary Key)
  email: str (Único)
  name: str
  password_hash: str (Hash PBKDF2)
  role: str (admin | engenheiro | gerente)
  is_active: bool
  created_at: datetime
)
```

**Métodos úteis:**
- `user.set_password(password)` - Hash de senha
- `user.check_password(password)` - Verificar senha
- `user.is_admin()` - Verificar se é admin
- `user.to_dict()` - Converter para dicionário

---

### 2. **Serviço de Autenticação**
```
src/services/auth_service.py
├── AuthService (classe)
│   ├── generate_token() - Gera JWT
│   ├── verify_token() - Valida JWT
│   ├── login() - Faz login
│   └── register_user() - Registra novo usuário
├── @token_required - Decorador para qualquer autenticado
├── @admin_required - Decorador para admin
└── @role_required(*roles) - Decorador para roles específicas
```

---

### 3. **Controller de Usuários**
```
src/controllers/user_controller.py
├── list_users() - GET /api/users (admin)
├── create_user() - POST /api/users (admin)
├── get_user() - GET /api/users/<id> (admin)
├── update_user() - PUT /api/users/<id> (admin)
├── delete_user() - DELETE /api/users/<id> (admin)
├── change_password() - POST /api/users/change-password (autenticado)
└── get_current_user() - GET /api/users/me (autenticado)
```

---

### 4. **Rotas de Usuários**
```
src/routes/user_routes.py
├── /api/users [GET] - Listar (admin)
├── /api/users [POST] - Criar (admin)
├── /api/users/me [GET] - Dados atuais (autenticado)
├── /api/users/<id> [GET] - Obter um (admin)
├── /api/users/<id> [PUT] - Atualizar (admin)
├── /api/users/<id> [DELETE] - Deletar (admin)
└── /api/users/change-password [POST] - Mudar senha (autenticado)
```

---

### 5. **Rotas de Autenticação Atualizadas**
```
src/routes/login_routes.py
├── /api/auth/login [POST] - Login
└── /api/auth/logout [POST] - Logout
```

---

### 6. **Script de Inicialização**
```bash
python init_db.py
```
✅ Cria banco de dados  
✅ Cria admin inicial  
✅ Cria usuários de exemplo  

**Admin padrão:**
- Email: `admin@anchordata.com`
- Senha: `admin123456`

---

### 7. **Migration Alembic**
```
migrations/versions/new_auth_system.py
```
Adiciona/atualiza colunas:
- `email` (único)
- `role` (renomeada de function)
- `is_active`
- `created_at`

---

### 8. **Documentação Completa**
```
├── GUIA_AUTENTICACAO.md - Guia de implementação
├── API_AUTENTICACAO.md - Documentação API
├── EXEMPLOS_DECORADORES.py - Exemplos práticos
└── backend/.env.example - Template de variáveis
```

---

## 🔄 Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    {email, password}
       ↓
┌──────────────────────────────────┐
│   Servidor Flask                 │
│  ├─ Busca usuário no BD          │
│  ├─ Verifica hash de senha       │
│  └─ Gera JWT Token               │
└──────┬───────────────────────────┘
       │
       │ 2. Retorna token
       │    {token, user_data}
       ↓
┌──────────────────────────────────┐
│   Cliente (localStorage)         │
│   Armazena token                 │
└──────┬───────────────────────────┘
       │
       │ 3. Próximas requisições
       │    Header: Authorization: Bearer <token>
       ↓
┌──────────────────────────────────┐
│   Servidor Flask                 │
│  ├─ Extrai token do header       │
│  ├─ Valida JWT                   │
│  ├─ Verifica role                │
│  └─ Executa rota protegida       │
└──────────────────────────────────┘
```

---

## 🛡️ Três Níveis de Proteção

### 1️⃣ **Qualquer usuário autenticado**
```python
@token_required
def protected_route():
    # Acesso: admin, engenheiro, gerente
```

### 2️⃣ **Roles específicas**
```python
@role_required(UserRole.ENGENHEIRO.value, UserRole.ADMIN.value)
def engineers_route():
    # Acesso: engenheiro, admin (não gerente)
```

### 3️⃣ **Apenas admin**
```python
@admin_required
def admin_route():
    # Acesso: admin
```

---

## 📊 Estrutura de Dados do Token JWT

```json
{
  "user_id": 1,
  "email": "admin@anchordata.com",
  "role": "admin",
  "exp": 1706348400,
  "iat": 1706262000
}
```

**Validade:** 24 horas  
**Algoritmo:** HS256  
**Secret:** Variável de ambiente `JWT_SECRET`

---

## 🚀 Quick Start

```bash
# 1. Instalar dependências
cd backend
pip install -r requirements.txt

# 2. Configurar .env
cp .env.example .env
# Editar com DATABASE_URL e JWT_SECRET

# 3. Inicializar banco
python init_db.py

# 4. Executar servidor
python run.py
```

---

## 📋 Checklist de Próximas Ações

- [ ] Copiar `.env.example` para `.env` e configurar
- [ ] Executar `python init_db.py`
- [ ] Testar login com credenciais de exemplo
- [ ] Testar endpoints com Postman/curl
- [ ] Integrar no frontend (armazenar token)
- [ ] Proteger rotas do frontend com roles
- [ ] Testar com usuários reais
- [ ] Mudar senhas em produção

---

## 🔗 Arquivos Principais

| Arquivo | Propósito |
|---------|-----------|
| `src/models/user_model.py` | Modelo de usuário com roles |
| `src/services/auth_service.py` | JWT, decoradores, validações |
| `src/controllers/user_controller.py` | CRUD de usuários |
| `src/routes/user_routes.py` | Endpoints de usuários |
| `src/routes/login_routes.py` | Login/logout |
| `src/controllers/login_controller.py` | Lógica de login |
| `init_db.py` | Script de inicialização |
| `database/config.py` | Configuração (PostgreSQL ready) |
| `requirements.txt` | Novas dependências |

---

## ⚠️ Segurança em Produção

```bash
# 1. Gerar JWT_SECRET forte
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Usar variáveis de ambiente
export DATABASE_URL="postgresql://..."
export JWT_SECRET="seu-token-super-secreto"

# 3. Usar HTTPS
# 4. Configurar CORS apropriadamente
# 5. Usar senhas fortes
# 6. Implementar rate limiting (opcional)
# 7. Fazer backup do banco (opcional)
```

---

## 📞 Estrutura Completa Implementada

```
ROLES (3 tipos)
├── 👨‍💼 ADMIN
│   └── Gerencia usuários, vê tudo
├── 🔧 ENGENHEIRO
│   └── Acessa máquinas e relatórios
└── 📊 GERENTE
    └── Acessa dashboards e relatórios

AUTENTICAÇÃO
├── Login com email/senha
├── Token JWT (24h)
└── Logout (frontend removes token)

AUTORIZAÇÃO
├── @token_required - Qualquer autenticado
├── @role_required - Roles específicas
└── @admin_required - Apenas admin

GESTÃO DE USUÁRIOS
├── Admin cria usuários
├── Define role ao criar
├── Pode ativar/desativar
└── Pode alterar role depois

PERFIL DE USUÁRIO
├── Ver dados próprios
├── Alterar senha própria
└── Logout
```

---

✅ **Sistema pronto para uso!** 

Próximo passo: Integrar com o frontend 🎯
