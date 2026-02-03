# Sistema de Autenticação - Documentação da API

## Visão Geral

Sistema de autenticação baseado em JWT com suporte a três roles:
- **Admin**: Acesso total à aplicação e gerenciamento de usuários
- **Engenheiro**: Acesso a máquinas e relatórios
- **Gerente**: Acesso a dashboards e relatórios

## Credenciais Iniciais

Após executar `python init_db.py`, use:

```
Email: admin@anchordata.com
Senha: admin123456
```

⚠️ **IMPORTANTE**: Mude a senha do admin no primeiro acesso!

## Endpoints

### Autenticação

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}

Resposta (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-01-27T10:00:00"
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Resposta (200):
{
  "success": true,
  "message": "Desconectado com sucesso"
}
```

### Gerenciamento de Usuários (Admin Only)

#### Listar todos os usuários
```
GET /api/users
Authorization: Bearer <admin_token>

Resposta (200):
{
  "success": true,
  "total": 3,
  "users": [
    {
      "id": 1,
      "email": "admin@anchordata.com",
      "name": "Administrador",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-01-27T10:00:00"
    },
    ...
  ]
}
```

#### Criar novo usuário
```
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "novo@anchordata.com",
  "name": "Nome do Novo Usuário",
  "password": "senha123",
  "role": "engenheiro"  # "admin", "engenheiro" ou "gerente"
}

Resposta (201):
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 2,
    "email": "novo@anchordata.com",
    "name": "Nome do Novo Usuário",
    "role": "engenheiro",
    "is_active": true,
    "created_at": "2026-01-27T10:00:00"
  }
}
```

#### Obter informações de um usuário
```
GET /api/users/<user_id>
Authorization: Bearer <admin_token>

Resposta (200):
{
  "success": true,
  "user": { ... }
}
```

#### Atualizar usuário
```
PUT /api/users/<user_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Novo Nome",
  "role": "gerente",
  "is_active": false
}

Resposta (200):
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": { ... }
}
```

#### Deletar usuário
```
DELETE /api/users/<user_id>
Authorization: Bearer <admin_token>

Resposta (200):
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

### Gerenciamento de Perfil (Autenticado)

#### Obter dados do usuário atual
```
GET /api/users/me
Authorization: Bearer <token>

Resposta (200):
{
  "success": true,
  "user": { ... }
}
```

#### Alterar senha própria
```
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "senha_atual",
  "new_password": "nova_senha"
}

Resposta (200):
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

## Decoradores de Autorização

### `@token_required`
Valida se o usuário está autenticado com um token JWT válido.

```python
from src.services.auth_service import token_required

@app.route('/protected')
@token_required
def protected_route():
    user_id = request.user_id
    user_email = request.user_email
    user_role = request.user_role
    # ...
```

### `@admin_required`
Valida se o usuário está autenticado e tem role de admin.

```python
from src.services.auth_service import admin_required

@app.route('/admin-only')
@admin_required
def admin_route():
    # ...
```

### `@role_required(*roles)`
Valida se o usuário tem uma das roles especificadas.

```python
from src.services.auth_service import role_required

@app.route('/engineers-only')
@role_required('engenheiro', 'admin')
def engineers_route():
    # Apenas engenheiros e admins
```

## Fluxo de Autenticação

1. **Login**: Cliente envia email e senha
2. **Validação**: Servidor valida credenciais no banco
3. **Token**: Servidor gera JWT com informações do usuário
4. **Armazenamento**: Cliente armazena token (localStorage/sessionStorage)
5. **Requisições**: Cliente envia token no header `Authorization: Bearer <token>`
6. **Validação**: Servidor valida token em cada requisição protegida
7. **Autorização**: Servidor verifica role do usuário

## Tratamento de Erros

```json
{
  "error": "Mensagem de erro descritiva"
}
```

### Códigos HTTP comuns

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autenticado
- **403**: Acesso negado (autorização)
- **404**: Não encontrado
- **500**: Erro do servidor

## Segurança

- Senhas são hasheadas com Werkzeug (PBKDF2)
- Tokens JWT expiram em 24 horas
- Secret key deve estar em variável de ambiente (`JWT_SECRET`)
- Senhas mínimas de 6 caracteres
- Validação de email (deve conter @)
- Proteção contra auto-deleção

## Variáveis de Ambiente

```env
# Banco de dados PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/anchordata

# JWT Secret (deve ser forte em produção)
JWT_SECRET=sua-chave-super-secreta-aqui

# Ambiente
FLASK_ENV=production
```

## Próximos Passos

1. Configurar variáveis de ambiente
2. Executar `python init_db.py` para criar banco e admin
3. Testar endpoints com Postman ou curl
4. Integrar autenticação no frontend
5. Implementar logout e refresh token (opcional)
