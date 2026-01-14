import React from 'react';
// Remova a importação do BrowserRouter, ele já está no index.js
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Importe suas páginas e o Layout
import Login from '../pages/Login/Login';
import Maquinas from '../pages/Maquinas/Maquinas';
import Layout from '../components/Layout/Layout';

// Um componente simples para simular rotas que ainda não foram criadas
const Placeholder = ({ title }) => (
  <div style={{ color: 'white', fontSize: '32px', padding: '40px' }}>{title}</div>
);

// Componente "Wrapper" para rotas que usam o Layout
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet /> {/* O Outlet renderizará a rota filha correspondente */}
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    // O <Routes> funciona como um switch para suas rotas.
    // O <BrowserRouter> não deve estar aqui.
    <Routes>
      {/* Rota de Login (página separada, sem layout) */}
      <Route path="/login" element={<Login />} />

      {/* Rotas que compartilham o mesmo Layout (com Sidebar) */}
      <Route element={<LayoutWrapper />}>
        <Route path="/maquinas" element={<Maquinas />} />
        <Route path="/relatorios" element={<Placeholder title="Relatórios" />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/configuracoes" element={<Placeholder title="Configurações" />} />
        <Route path="/usuarios" element={<Placeholder title="Usuários" />} />
      </Route>

      {/* Rota padrão: redireciona para a página de login se a URL for a raiz "/" */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Opcional: Uma rota "catch-all" para páginas não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
