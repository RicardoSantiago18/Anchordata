import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Estilos para o Layout e Sidebar
const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#333a45', // Cor de fundo principal
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c323b', // Cor de fundo da sidebar
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  brand: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#28a745', // Verde
    marginBottom: '40px',
    textAlign: 'center',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    color: '#b0b0b0',
    textDecoration: 'none',
    borderRadius: '5px',
    marginBottom: '10px',
    fontSize: '16px',
  },
  navLinkActive: {
    backgroundColor: '#28a745', // Verde
    color: '#fff',
  },
  navIcon: {
    marginRight: '15px',
    width: '20px',
    height: '20px',
  },
  content: {
    flex: 1,
    padding: '40px',
  },
};

// Componente do item de navegação
const NavItem = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} style={{ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) }}>
      <span style={styles.navIcon}>{icon}</span>
      {children}
    </Link>
  );
};

// Componente principal do Layout
const Layout = ({ children }) => {
  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>AnchorData</div>
        <nav style={styles.nav}>
          <NavItem to="/maquinas">Máquinas</NavItem>
          <NavItem to="/relatorios">Relatórios</NavItem>
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/configuracoes">Configurações</NavItem>
          <NavItem to="/usuarios">Usuários</NavItem>
        </nav>
      </aside>
      <main style={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
