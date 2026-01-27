# Sistema de Autenticação - Guia de Implementação

## 📋 Resumo das Mudanças

Um sistema completo de autenticação foi implementado com:

✅ **Autenticação JWT** - Tokens com expiração de 24h  
✅ **Três Roles** - Admin, Engenheiro, Gerente  
✅ **Gestão de Usuários** - CRUD completo (apenas admin)  
✅ **Hash de Senhas** - Usando Werkzeug (PBKDF2)  
✅ **Decoradores de Autorização** - @token_required, @admin_required, @role_required  
✅ **PostgreSQL Ready** - Suporta PostgreSQL e SQLite  

## 🚀 Como Começar

### 1. Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
# Para PostgreSQL:
DATABASE_URL=postgresql://user:password@localhost:5432/anchordata
JWT_SECRET=sua-chave-super-secreta-aqui
```

### 3. Inicializar o banco de dados

```bash
python init_db.py
```

Este script irá:
- ✅ Criar todas as tabelas
- ✅ Criar usuário admin (admin@anchordata.com / admin123456)
- ✅ Criar usuários de exemplo (engenheiro e gerente)

### 4. Executar a aplicação

```bash
python run.py
```

## 📚 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Usuários (Admin only)
- `GET /api/users` - Listar todos
- `POST /api/users` - Criar novo
- `GET /api/users/<id>` - Obter um
- `PUT /api/users/<id>` - Atualizar
- `DELETE /api/users/<id>` - Deletar

### Perfil (Autenticado)
- `GET /api/users/me` - Dados do usuário atual
- `POST /api/users/change-password` - Alterar senha

## 🔐 Usando Autenticação em Suas Rotas

### Exemplo: Proteger uma rota

```python
from flask import Blueprint, jsonify, request
from src.services.auth_service import token_required, role_required
from src.models.user_model import UserRole

bp = Blueprint('maquina', __name__)

# Qualquer usuário autenticado
@bp.route('/maquinas', methods=['GET'])
@token_required
def list_maquinas():
    user_id = request.user_id
    # ...

# Apenas engenheiros e admins
@bp.route('/maquinas', methods=['GET'])
@role_required(UserRole.ENGENHEIRO.value, UserRole.ADMIN.value)
def list_maquinas():
    # ...

# Apenas admin
@bp.route('/usuarios', methods=['GET'])
@admin_required
def list_usuarios():
    # ...
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
```
backend/
├── init_db.py                          # Script de inicialização
├── EXEMPLOS_DECORADORES.py             # Exemplos de uso
├── .env.example                        # Template de variáveis
├── src/
│   ├── controllers/
│   │   └── user_controller.py          # Controller de usuários
│   ├── routes/
│   │   └── user_routes.py              # Rotas de usuários
│   └── services/
│       └── auth_service.py             # Serviço de autenticação
└── migrations/versions/
    └── new_auth_system.py              # Migration Alembic
```

### Arquivos Modificados
```
backend/
├── requirements.txt                    # +PyJWT, +Werkzeug
├── src/
│   ├── app.py                          # Registrar user_bp
│   ├── models/
│   │   └── user_model.py               # Novo User model com roles
│   ├── controllers/
│   │   └── login_controller.py         # Login real
│   └── routes/
│       └── login_routes.py             # Adicionar logout
└── database/
    └── config.py                       # Suporte PostgreSQL
```

## 🔑 Credenciais Padrão (após init_db.py)

```
Admin
  Email: admin@anchordata.com
  Senha: admin123456

Engenheiro (exemplo)
  Email: engenheiro1@anchordata.com
  Senha: eng123456

Gerente (exemplo)
  Email: gerente1@anchordata.com
  Senha: ger123456
```

⚠️ **IMPORTANTE**: Mude essas senhas em produção!

## 🧪 Testar com curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@anchordata.com","password":"admin123456"}'

# Resposta conterá o token JWT
# Use o token em requisições posteriores:

# Listar usuários
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🛡️ Segurança

✅ Senhas hasheadas com PBKDF2 (Werkzeug)  
✅ Tokens JWT com expiração de 24h  
✅ Validação de email  
✅ Proteção contra auto-deleção  
✅ Variáveis de ambiente para secrets  
✅ CORS configurado  

## 🔧 Troubleshooting

### Erro: "No module named 'jwt'"
```bash
pip install PyJWT
```

### Erro: "No module named 'werkzeug'"
```bash
pip install Werkzeug
```

### Erro de banco de dados
Verifique `DATABASE_URL` em `.env` e se o PostgreSQL está rodando:
```bash
# PostgreSQL em Linux
sudo systemctl status postgresql

# PostgreSQL em Windows
# Verificar serviço nas configurações do Windows
```

### Erro ao rodar init_db.py
1. Certifique-se de estar no diretório `backend`
2. Verifique se `.env` está configurado
3. Execute: `python init_db.py`

## 📖 Documentação Completa

Veja [API_AUTENTICACAO.md](../API_AUTENTICACAO.md) para:
- Documentação completa de endpoints
- Exemplos de requisições/respostas
- Detalhes de decoradores
- Tratamento de erros

## 🚀 Próximos Passos

1. ✅ Integrar autenticação no frontend (token em localStorage)
2. ✅ Implementar login/logout no React
3. ✅ Proteger rotas do frontend baseado em roles
4. ✅ Implementar refresh token (opcional)
5. ✅ Adicionar 2FA (opcional)

## 📞 Suporte

Para mais detalhes, consulte:
- `EXEMPLOS_DECORADORES.py` - Exemplos práticos
- `src/services/auth_service.py` - Implementação
- `src/controllers/user_controller.py` - Endpoints
