# ⚓ Anchordata Sistema de Gerenciamento e Auxiliar de Manutenção

**Sistema inteligente de gestão e manutenção preventiva e corretiva de máquinas industriais com assistente de IA (RAG).**

Anchordata é uma aplicação full-stack que combina cadastro e monitoramento de máquinas industriais com um assistente de chat baseado em **Retrieval-Augmented Generation (RAG)**, permitindo consultas contextuais sobre manuais técnicos de cada equipamento.

---

## 📑 Índice

- [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Como Rodar](#-como-rodar)
- [Primeiro Uso](#-primeiro-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas da API](#-rotas-da-api)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Testes](#-testes)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Referências](#-referências)

---

## 🏗 Visão Geral da Arquitetura

```
┌────────────────────┐         ┌─────────────────────────┐
│                    │  HTTP   │                         │
│   Frontend React   │◄───────►│    Backend Flask API     │
│   (Vite + MUI)     │  :5173  │       :5000              │
│                    │         │                         │
└────────────────────┘         ├─────────┬───────────────┤
                               │ SQLAlchemy│  LangChain   │
                               │  (ORM)   │  RAG Chain   │
                               ├─────────┤───────────────┤
                               │ SQLite / │  FAISS        │
                               │PostgreSQL│  VectorStore  │
                               └─────────┴───────────────┘
```

A aplicação segue o padrão **MVC** (Models, Controllers, Routes) no backend, com uma camada de **Services** para a lógica de negócio. O frontend utiliza **React** com roteamento protegido via JWT.

---

## 🛠 Tecnologias Utilizadas

### Backend
| Tecnologia | Descrição |
|---|---|
| **Python** | Linguagem principal do backend |
| **Flask** | Framework web (com Application Factory pattern) |
| **SQLAlchemy** | ORM para modelagem de dados |
| **Flask-Migrate / Alembic** | Migrações de banco de dados |
| **Flask-CORS** | Suporte cross-origin para o frontend |
| **JWT (PyJWT)** | Autenticação via tokens |
| **LangChain** | Framework para chains de IA (RAG) |
| **FAISS** | Busca vetorial para documentos técnicos |
| **HuggingFace Embeddings** | Modelo de embeddings `all-MiniLM-L6-v2` |
| **OpenAI** | LLM para geração de respostas (via LangChain) |
| **WeasyPrint** | Geração de relatórios em PDF |
| **Pytest** | Framework de testes |

### Frontend
| Tecnologia | Descrição |
|---|---|
| **React 19** | Biblioteca de UI |
| **Vite 7** | Build tool e dev server |
| **Material UI (MUI) 7** | Biblioteca de componentes visuais |
| **React Router DOM 7** | Roteamento SPA |
| **Recharts** | Gráficos e visualização de dados |
| **React Markdown** | Renderização de markdown no chat |
| **Emotion** | CSS-in-JS para estilização |

### Banco de Dados
- **SQLite** — desenvolvimento local (padrão)
- **PostgreSQL** — recomendado para produção

---

## 📋 Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta | Versão Mínima | Como verificar |
|---|---|---|
| **Python** | 3.10+ | `python --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | 2.x | `git --version` |
| **PostgreSQL** *(opcional)* | 14+ | `psql --version` |

> [!TIP]
> No Windows, recomenda-se usar o **Windows Terminal** com **PowerShell** para melhor experiência.

---

## ⚙ Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/RicardoSantiago18/Anchordata.git
cd Anchordata
```

### 2. Configurar o Backend

```bash
# Navegar para o diretório do backend
cd backend

# Criar e ativar o ambiente virtual
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente do Backend

```bash
# Copiar o arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de dados (escolha um)
DATABASE_URL=sqlite:///app.db                          # Desenvolvimento
# DATABASE_URL=postgresql://user:senha@localhost:5432/anchordata_db  # Produção

# Chave secreta para JWT (MUDE EM PRODUÇÃO!)
JWT_SECRET=sua-chave-super-secreta-aqui

# Flask
FLASK_ENV=development
FLASK_DEBUG=True

# CORS — origens permitidas
ALLOWED_HOSTS=http://localhost:5173,http://localhost:3000

# API Keys (necessário para o assistente de IA)
OPENAI_API_KEY=sua-chave-openai-aqui
```

> [!IMPORTANT]
> A variável `OPENAI_API_KEY` é **obrigatória** para o funcionamento do chat com IA. Sem ela, o assistente RAG não conseguirá gerar respostas.

### 4. Inicializar o Banco de Dados

```bash
# Ainda dentro de backend/, com o venv ativado
python init_db.py
```

Este script irá:
- ✅ Criar todas as tabelas do banco de dados
- ✅ Criar um usuário **administrador** padrão
- ✅ Criar usuários de exemplo (engenheiro e gerente)

### 5. Configurar o Frontend

```bash
# Voltar para a raiz e entrar no frontend
cd ../frontend

# Instalar dependências
npm install
```

---

## 🚀 Como Rodar

Você precisa rodar **dois servidores** simultaneamente (em terminais separados):

### Terminal 1 — Backend (API Flask)

```bash
cd backend
.\venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate    # Linux/macOS

python run.py
```

O backend estará disponível em: **http://localhost:5000**

### Terminal 2 — Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

> [!NOTE]
> O frontend se comunica com o backend via API REST na porta `5000`. O CORS já está configurado para aceitar requisições de `localhost:5173`.

---

## 🎯 Primeiro Uso

Após rodar a aplicação pela primeira vez, siga estes passos:

### 1. Fazer Login

Acesse **http://localhost:5173** e utilize as credenciais criadas pelo `init_db.py`:

| Papel | E-mail | Senha |
|---|---|---|
| **Admin** | `admin@anchordata.com` | `admin123456` |
| **Engenheiro** | `engenheiro1@anchordata.com` | `eng123456` |
| **Gerente** | `gerente1@anchordata.com` | `ger123456` |

> [!CAUTION]
> **Mude a senha do administrador no primeiro acesso!** As senhas padrão são apenas para desenvolvimento.

### 2. Cadastrar Máquinas

1. No menu lateral, acesse **Máquinas**
2. Clique em **Adicionar Máquina**
3. Preencha os dados: nome, número de série, fabricante, marca, setor, etc.
4. (Opcional) Faça upload de imagem e manual técnico (PDF)

### 3. Utilizar o Chat com IA

1. Acesse a seção **Chat** no menu
2. Selecione uma máquina para contexto
3. Faça perguntas técnicas sobre o equipamento — o assistente utilizará o manual como base (RAG)

### 4. Gerenciar Manutenções

1. Na página de detalhes de uma máquina, acesse o histórico de manutenções
2. Registre eventos de manutenção na timeline
3. Gere relatórios em PDF

---

## 📁 Estrutura do Projeto

```
Anchordata/
├── backend/
│   ├── .env.example              # Template de variáveis de ambiente
│   ├── requirements.txt          # Dependências Python
│   ├── run.py                    # Ponto de entrada da aplicação
│   ├── init_db.py                # Script de inicialização do banco
│   ├── database/
│   │   ├── config.py             # Configuração (DB, JWT)
│   │   └── db.py                 # Instância do SQLAlchemy
│   ├── migrations/               # Migrações Alembic
│   ├── data/
│   │   ├── machines/             # Imagens e manuais das máquinas
│   │   └── vectorstore/          # Indexes FAISS por máquina
│   ├── src/
│   │   ├── app.py                # Application Factory (Flask)
│   │   ├── llm.py                # Configuração do LLM
│   │   ├── rag_chain.py          # Pipeline RAG principal
│   │   ├── ingest.py             # Ingestão de PDFs para vectorstore
│   │   ├── models/               # Modelos SQLAlchemy
│   │   │   ├── user_model.py     # User (Admin, Engenheiro, Gerente)
│   │   │   ├── maquina_model.py  # Machine
│   │   │   ├── chat_model.py     # Chat
│   │   │   ├── message_model.py  # Message
│   │   │   └── timeline_event_model.py
│   │   ├── controllers/          # Controllers (lógica de request/response)
│   │   ├── routes/               # Blueprints das rotas da API
│   │   ├── services/             # Camada de serviços (lógica de negócio)
│   │   │   ├── auth_service.py   # Autenticação e JWT
│   │   │   ├── chat_service.py   # Gestão de chats
│   │   │   ├── message_service.py
│   │   │   ├── maquina_service.py
│   │   │   ├── maintenance_flow_service.py
│   │   │   ├── pdf_service.py    # Geração de PDFs
│   │   │   └── ai/               # Serviços de IA
│   │   ├── chains/               # LangChain Chains
│   │   │   ├── report_chain.py   # Chain de relatórios
│   │   │   ├── status_chain.py   # Chain de status
│   │   │   └── event_chain.py    # Chain de eventos
│   │   ├── system_prompts/       # Prompts do sistema para LLM
│   │   ├── templates/            # Templates (PDF, etc.)
│   │   └── utils/                # Utilitários
│   ├── scripts/                  # Scripts auxiliares
│   └── tests/                    # Testes automatizados
│       ├── conftest.py           # Fixtures do pytest
│       ├── test_api.py
│       ├── test_flow.py
│       ├── test_machine_creation.py
│       ├── test_machine_details.py
│       └── test_pdf.py
│
├── frontend/
│   ├── package.json              # Dependências Node.js
│   ├── vite.config.js            # Configuração do Vite
│   ├── index.html                # HTML raiz
│   └── src/
│       ├── main.jsx              # Entry point do React
│       ├── App.jsx               # Rotas e providers
│       ├── context/
│       │   └── AuthContext.jsx   # Contexto de autenticação
│       ├── services/             # Serviços API
│       │   ├── auth.service.js   # Login, registro, JWT
│       │   ├── chat.service.js   # API do chat
│       │   └── user.service.js   # API de usuários
│       ├── components/           # Componentes React
│       │   ├── login.jsx         # Tela de login
│       │   ├── Home.jsx          # Dashboard principal
│       │   ├── Layout.jsx        # Layout com sidebar
│       │   ├── Header.jsx        # Cabeçalho
│       │   ├── chat.jsx          # Chat com IA
│       │   ├── cadmaq.jsx        # Listagem de máquinas
│       │   ├── AdicionarMaquina.jsx  # Formulário de cadastro
│       │   ├── VisualizarMaquina.jsx # Detalhes da máquina
│       │   ├── caduser.jsx       # Gestão de usuários
│       │   ├── UserProfile.jsx   # Perfil do usuário
│       │   └── ProtectedRoute.jsx    # Guard de autenticação
│       ├── hooks/                # Custom hooks
│       └── assets/               # Imagens e recursos estáticos
│
├── Instruções/                   # Documentação técnica interna
├── .gitignore
└── README.md
```

---

## 🔌 Rotas da API

### Autenticação (`/login`)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/login` | Autenticação de usuário (retorna JWT) |

### Usuários (`/users`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users` | Listar usuários |
| `POST` | `/users` | Criar usuário |
| `PUT` | `/users/:id` | Atualizar usuário |
| `DELETE` | `/users/:id` | Remover usuário |

### Máquinas (`/machines`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/machines` | Listar máquinas |
| `POST` | `/machines` | Cadastrar máquina |
| `GET` | `/machines/:id` | Detalhes de uma máquina |
| `PUT` | `/machines/:id` | Atualizar máquina |
| `DELETE` | `/machines/:id` | Remover máquina |

### Chat IA (`/chat`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/chat` | Listar conversas |
| `POST` | `/chat` | Criar nova conversa |

### Mensagens (`/messages`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/messages/:chat_id` | Listar mensagens de um chat |
| `POST` | `/messages` | Enviar mensagem (gera resposta IA) |

### Manutenções (`/maintenance`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/maintenance` | Listar manutenções |
| `POST` | `/maintenance` | Registrar manutenção |

### Home/Dashboard (`/home`)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/home` | Dados do dashboard |

> [!NOTE]
> Todas as rotas (exceto `/login`) requerem o header `Authorization: Bearer <token_jwt>`.

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação JWT** com roles (Admin, Engenheiro, Gerente)
- 🏭 **Cadastro de máquinas** com upload de imagem e manual técnico (PDF)
- 🤖 **Chat com IA (RAG)** — perguntas contextuais baseadas nos manuais técnicos das máquinas
- 📊 **Dashboard** com visão geral das máquinas e métricas
- 🔧 **Gestão de manutenções** com timeline de eventos
- 📄 **Geração de relatórios em PDF** via IA
- 👥 **Gestão de usuários** com controle de acesso por perfil
- 🔍 **Busca vetorial (FAISS)** por máquina para respostas contextuais precisas

---

## 🧪 Testes

O backend possui testes automatizados com **pytest**.

```bash
cd backend
.\venv\Scripts\Activate.ps1

# Rodar todos os testes
pytest

# Rodar com output detalhado
pytest -v

# Rodar um arquivo específico
pytest tests/test_api.py
```

---

## 🔒 Variáveis de Ambiente

Todas as variáveis são configuradas no arquivo `backend/.env`:

| Variável | Obrigatória | Descrição | Exemplo |
|---|---|---|---|
| `DATABASE_URL` | Não | URI do banco de dados | `sqlite:///app.db` |
| `JWT_SECRET` | Sim | Chave secreta para tokens JWT | `minha-chave-secreta-123` |
| `FLASK_ENV` | Não | Ambiente Flask | `development` |
| `FLASK_DEBUG` | Não | Modo debug | `True` |
| `ALLOWED_HOSTS` | Não | Origens CORS permitidas | `http://localhost:5173` |
| `OPENAI_API_KEY` | Sim* | Chave API da OpenAI | `sk-...` |
| `LANGCHAIN_API_KEY` | Não | Chave API da LangChain | — |

> \* Obrigatória para o funcionamento do assistente de IA

---

## 📚 Referências

Este projeto foi desenvolvido com base em boas práticas e materiais de estudo, incluindo:

- **Miguel Grinberg** – [Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world)
- **LangChain** – [Documentação oficial](https://python.langchain.com/docs/)
- **FAISS (Facebook AI)** – [GitHub](https://github.com/facebookresearch/faiss)
- **Material UI** – [Documentação](https://mui.com/)

As decisões de arquitetura (separação em models, controllers e routes, uso de SQLAlchemy moderno e herança polimórfica) foram influenciadas pelo Flask Mega-Tutorial.

---

## 📝 Licença

Este projeto é de uso privado / acadêmico.

---

<p align="center">
  Desenvolvido com ❤️ pela equipe <strong>Anchordata</strong>
</p>
