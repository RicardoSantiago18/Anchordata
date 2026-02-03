# 🚀 Guia Rápido - Sistema de Autenticação

## ✅ Integração Concluída!

O sistema de autenticação JWT foi integrado com sucesso ao frontend da aplicação AnchorData.

## 🎯 O que foi implementado?

### Autenticação Completa
- ✅ Login com email e senha
- ✅ Logout seguro
- ✅ Proteção de rotas
- ✅ Controle de acesso por roles (admin, engenheiro, gerente)
- ✅ Gerenciamento de perfil
- ✅ Alteração de senha
- ✅ Token JWT em todas as requisições

### Interface Moderna
- ✅ Header com informações do usuário
- ✅ Navegação entre páginas
- ✅ Página de perfil
- ✅ Mensagens de erro e sucesso
- ✅ Design responsivo e moderno

## 🏃 Como Testar

### 1. Backend deve estar rodando
```bash
cd backend
python run.py
```

### 2. Frontend já está rodando
O servidor de desenvolvimento Vite já foi iniciado em: **http://localhost:5173**

### 3. Fazer Login
Acesse o navegador e use as credenciais padrão:
- **Email**: `admin@anchordata.com`
- **Senha**: `admin123456`

### 4. Testar Funcionalidades

#### Após o Login:
1. **Verificar Header** - Deve mostrar seu nome e role
2. **Navegar para Máquinas** - Clique no botão "Máquinas"
3. **Acessar Perfil** - Clique no botão "Perfil"
4. **Alterar Senha** - Na página de perfil, altere sua senha
5. **Fazer Logout** - Clique em "Sair" no header

#### Testar Proteção:
1. Faça logout
2. Tente acessar diretamente: `http://localhost:5173/maquinas`
3. Você será redirecionado para `/login` automaticamente ✅

## 📁 Estrutura Criada

```
frontend/src/
├── services/
│   ├── auth.service.js      ← Serviço de autenticação
│   └── chat.service.js      ← Atualizado com JWT
├── context/
│   └── AuthContext.jsx      ← Context de autenticação
├── hooks/
│   └── useAuth.js           ← Hook customizado
├── components/
│   ├── ProtectedRoute.jsx   ← Proteção de rotas
│   ├── Header.jsx           ← Cabeçalho da aplicação
│   ├── Header.css
│   ├── UserProfile.jsx      ← Página de perfil
│   ├── UserProfile.css
│   ├── login.jsx            ← Atualizado com autenticação
│   └── login.css            ← Atualizado com estilos de erro
└── App.jsx                  ← Atualizado com rotas protegidas

frontend/
└── .env                     ← Configuração da API
```

## 🔐 Credenciais de Teste

### Admin (Acesso Total)
- Email: `admin@anchordata.com`
- Senha: `admin123456`

⚠️ **IMPORTANTE**: Altere a senha do admin no primeiro acesso!

## 🎨 Recursos Visuais

- **Gradientes modernos** no header
- **Glassmorphism** nos botões
- **Animações suaves** nas interações
- **Mensagens de erro** com animação shake
- **Loading states** durante requisições
- **Design responsivo** para mobile

## 🔄 Fluxo de Autenticação

1. **Usuário acessa a aplicação** → Redirecionado para `/login`
2. **Faz login** → Token JWT armazenado no localStorage
3. **Acessa rotas protegidas** → Token enviado no header de cada requisição
4. **Token válido** → Acesso permitido
5. **Token expirado/inválido** → Logout automático e redirecionamento

## 🛠️ Configuração da API

O arquivo `.env` foi criado com:
```env
VITE_API_URL=http://localhost:5000/api
```

Se sua API estiver em outra URL, edite este arquivo e reinicie o servidor.

## 📱 Rotas Disponíveis

### Públicas
- `/` → Redireciona para `/login`
- `/login` → Tela de login

### Protegidas (requerem autenticação)
- `/maquinas` → Cadastro de máquinas
- `/chat` → Chat genérico
- `/chat/:id` → Chat por máquina
- `/perfil` → Perfil e alteração de senha

## 🧪 Checklist de Testes

- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas (deve mostrar erro)
- [ ] Redirecionamento após login bem-sucedido
- [ ] Proteção de rotas (tentar acessar sem login)
- [ ] Navegação entre páginas
- [ ] Visualização do perfil
- [ ] Alteração de senha
- [ ] Logout
- [ ] Persistência de sessão (recarregar página)

## 💡 Dicas

1. **Abra o DevTools** (F12) para ver:
   - Token JWT no localStorage
   - Requisições com header Authorization
   - Logs de erro/sucesso

2. **Teste diferentes cenários**:
   - Senha incorreta
   - Token expirado (limpe o localStorage)
   - Requisições sem autenticação

3. **Altere a senha do admin** no primeiro acesso por segurança

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `INTEGRACAO_AUTENTICACAO_COMPLETA.md` - Documentação completa
- `API_AUTENTICACAO.md` - Documentação da API
- `INTEGRACAO_FRONTEND.jsx` - Exemplos de código

## ✨ Próximos Passos

Agora você pode:
1. Criar mais usuários via API (com diferentes roles)
2. Testar o controle de acesso por role
3. Implementar páginas específicas para cada role
4. Adicionar mais funcionalidades protegidas

---

**Tudo pronto!** 🎉 O sistema de autenticação está integrado e funcionando.
