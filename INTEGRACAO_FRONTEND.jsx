/**
 * EXEMPLO DE INTEGRAÇÃO DO SISTEMA DE AUTENTICAÇÃO NO FRONTEND REACT
 * 
 * Este arquivo mostra como integrar a autenticação JWT no seu frontend React.
 * Adapte conforme necessário para sua aplicação.
 */

// ============================================================================
// 1. Serviço de Autenticação (src/services/auth.service.js)
// ============================================================================

export const AuthService = {
  /**
   * Faz login do usuário
   */
  login: async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer login');
      }

      const data = await response.json();

      // Armazenar token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Erro de login:', error);
      throw error;
    }
  },

  /**
   * Faz logout do usuário
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtém o token armazenado
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Obtém os dados do usuário armazenado
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated: () => {
    return !!AuthService.getToken();
  },

  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole: (role) => {
    const user = AuthService.getUser();
    return user && user.role === role;
  },

  /**
   * Verifica se o usuário tem uma das roles especificadas
   */
  hasAnyRole: (roles) => {
    const user = AuthService.getUser();
    return user && roles.includes(user.role);
  },

  /**
   * Verifica se é admin
   */
  isAdmin: () => {
    return AuthService.hasRole('admin');
  },

  /**
   * Obtém os dados do usuário atual
   */
  getCurrentUser: async () => {
    try {
      const token = AuthService.getToken();
      if (!token) return null;

      const response = await fetch('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  },

  /**
   * Altera a senha do usuário
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = AuthService.getToken();
      if (!token) throw new Error('Não autenticado');

      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar senha');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  },

  /**
   * Faz requisição protegida ao servidor
   */
  fetchProtected: async (url, options = {}) => {
    const token = AuthService.getToken();

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se 401, token expirou
    if (response.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }

    return response;
  },
};

// ============================================================================
// 2. Hook useAuth (src/hooks/useAuth.js)
// ============================================================================

import { useContext, createContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// ============================================================================
// 3. AuthProvider (src/context/AuthProvider.jsx)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth.service';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const storedUser = AuthService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// 4. Componente ProtectedRoute (src/components/ProtectedRoute.jsx)
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

// ============================================================================
// 5. Componente LoginForm (src/components/LoginForm.jsx)
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = () => {
  const [email, setEmail] = useState('admin@anchordata.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

// ============================================================================
// 6. App.jsx com rotas protegidas
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { MaquinasPage } from './pages/Maquinas';
import { AdminPage } from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginForm />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Apenas engenheiros e admins */}
          <Route
            path="/maquinas"
            element={
              <ProtectedRoute requiredRole="engenheiro">
                <MaquinasPage />
              </ProtectedRoute>
            }
          />

          {/* Apenas admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

// ============================================================================
// 7. Componente Header com informações do usuário
// ============================================================================

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div className="container">
        <h1>AnchorData</h1>

        {user && (
          <div className="user-info">
            <span>Bem-vindo, {user.name}!</span>
            <span className="role">({user.role})</span>

            {isAdmin && (
              <a href="/admin">Painel Admin</a>
            )}

            <button onClick={handleLogout}>Sair</button>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================================================
// 8. Página de Dashboard com conteúdo baseado em role
// ============================================================================

import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>

      {user.role === 'admin' && (
        <div>
          <h3>Dashboard Admin</h3>
          <p>Acesso total à aplicação</p>
          <ul>
            <li><a href="/admin">Gerenciar usuários</a></li>
            <li><a href="/maquinas">Ver máquinas</a></li>
            <li><a href="/relatorios">Ver relatórios</a></li>
          </ul>
        </div>
      )}

      {user.role === 'engenheiro' && (
        <div>
          <h3>Dashboard Engenheiro</h3>
          <p>Acesso a máquinas e relatórios</p>
          <ul>
            <li><a href="/maquinas">Minhas máquinas</a></li>
            <li><a href="/relatorios">Meus relatórios</a></li>
          </ul>
        </div>
      )}

      {user.role === 'gerente' && (
        <div>
          <h3>Dashboard Gerente</h3>
          <p>Acesso a dashboards e relatórios</p>
          <ul>
            <li><a href="/dashboards">Dashboards</a></li>
            <li><a href="/relatorios">Relatórios</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 9. Exemplo de página com requisição protegida
// ============================================================================

import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

export const MaquinasPage = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaquinas = async () => {
      try {
        const response = await AuthService.fetchProtected(
          'http://localhost:5000/api/maquinas'
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar máquinas');
        }

        const data = await response.json();
        setMaquinas(data.maquinas || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaquinas();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Máquinas</h2>
      <ul>
        {maquinas.map((m) => (
          <li key={m.id}>{m.nome}</li>
        ))}
      </ul>
    </div>
  );
};
