import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Divider, Typography, Avatar, Tooltip } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, Add as AddIcon, PeopleOutlined } from '@mui/icons-material';
import './Layout.css';

// import dos ícones do menu
import iconHome from '../assets/icons/icon-home-blue.png';
import iconMaquinas from '../assets/icons/icon-maquinas-blue.png';
import iconUsuarios from '../assets/icons/icon-usuarios-blue.png';
import iconSair from '../assets/icons/icon-sair-blue.png';

// import das logos menu
import logoProjeto from '../assets/Ativo 2@3x 1.png';
import logoGrandeProjeto from '../assets/Group 297.png'

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <Box className="app-viewport">
      {/* SIDEBAR */}
      <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo-wrapper">
          <Box className="sidebar-logo">
            <img
              src={isCollapsed ? logoProjeto : logoGrandeProjeto}
              alt="Logo do projeto"
              className="sidebar-logo-img"
            />
          </Box>
        </div>

        <Divider className="sidebar-divider" />

        <nav className="sidebar-nav-middle">
          <NavItem
            isCollapsed={isCollapsed}
            icon={<img src={iconHome} className="nav-icon-png" alt="Início" />}
            label="Início"
            active={isActive('/home')}
            onClick={() => navigate('/home')}
          />
          <NavItem
            isCollapsed={isCollapsed}
            icon={<img src={iconMaquinas} className="nav-icon-png" alt="Máquinas" />}
            label="Máquinas"
            active={location.pathname.includes('maquina') ? 'active' : ''}
            onClick={() => navigate('/maquinas')}
          />
          <NavItem
            isCollapsed={isCollapsed}
            icon={<img src={iconUsuarios} className="nav-icon-png" alt="Usuários" />}
            label="Usuários"
            active={isActive('/usuarios')}
            onClick={() => navigate('/usuarios')}
          />
        </nav>

        <div className="sidebar-footer">
          <Divider className="footer-divider" />
          <div className="logout-button" onClick={() => navigate('/login')}>
            <img src={iconSair} className="nav-icon-png" alt="Sair" />
            {!isCollapsed && <span>Sair</span>}
          </div>
        </div>

        <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <KeyboardArrowRight fontSize="small" /> : <KeyboardArrowLeft fontSize="small" />}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-layout">
        <header className="topbar-container">
          <div className="user-profile">
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#eee' }}>
              <PeopleOutlined fontSize="small" sx={{ color: '#666' }} />
            </Avatar>
            <Typography variant="body2" className="user-text">
              nome sobrenome
            </Typography>
          </div>

          <div className="topbar-actions">
            {location.pathname === '/usuarios' ? (
              <button
                className="btn-add-machine-top"
                onClick={() => window.dispatchEvent(new Event('abrir-modal-usuario'))}
              >
                <AddIcon fontSize="small" />
                <span>Novo Usuário</span>
              </button>
            ) : (
              <button
                className="btn-add-machine-top"
                onClick={() => navigate('/maquinas/adicionar')}
              >
                <AddIcon fontSize="small" />
                <span>Adicionar Máquina</span>
              </button>
            )}
          </div>
        </header>

        <div className="content-outlet">
          <Outlet />
        </div>
      </main>
    </Box>
  );
};

const NavItem = ({ icon, label, active, onClick, isCollapsed }) => (
  <Tooltip title={isCollapsed ? label : ''} placement="right" arrow>
    <div className={`nav-item ${active}`} onClick={onClick}>
      <div className="nav-icon-wrapper">{icon}</div>
      {!isCollapsed && <span className="nav-text">{label}</span>}
    </div>
  </Tooltip>
);

export default Layout;