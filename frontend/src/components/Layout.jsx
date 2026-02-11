import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Divider, Tooltip } from '@mui/material';
import {
  SettingsOutlined,
  PeopleOutlined,
  ExitToApp,
  NotificationsNone,
  HomeOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Add as AddIcon
} from '@mui/icons-material';
import './Layout.css';

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
          <Box className="sidebar-logo">{isCollapsed ? 'L' : 'Logo'}</Box>
        </div>

        <Divider className="sidebar-divider" />

        <nav className="sidebar-nav-middle">
          <NavItem
            isCollapsed={isCollapsed}
            icon={<HomeOutlined />}
            label="Início"
            active={isActive('/')}
            onClick={() => navigate('/')}
          />
          <NavItem
            isCollapsed={isCollapsed}
            icon={<SettingsOutlined />}
            label="Máquinas"
            active={location.pathname.includes('maquina') ? 'active' : ''}
            onClick={() => navigate('/maquinas')}
          />
          <NavItem
            isCollapsed={isCollapsed}
            icon={<PeopleOutlined />}
            label="Usuários"
            active={isActive('/usuarios')}
            onClick={() => navigate('/usuarios')}
          />
        </nav>

        <div className="sidebar-footer">
          <Divider className="footer-divider" />
          <div className="logout-button" onClick={() => navigate('/login')}>
            <ExitToApp className="nav-icon" />
            {!isCollapsed && <span>Sair</span>}
          </div>
        </div>

        <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <KeyboardArrowRight fontSize="small" /> : <KeyboardArrowLeft fontSize="small" />}
        </div>
      </aside>

      {/* área principal */}
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
            {/* botão para a rota de cadastro de máquinas */}
            <button 
              className="btn-add-machine-top" 
              onClick={() => navigate('/maquinas/adicionar')} 
            >
              <AddIcon fontSize="small" />
              <span>Adicionar Máquina</span>
            </button>

            <IconButton size="small" className="notif-icon">
              <NotificationsNone fontSize="small" />
            </IconButton>
          </div>
        </header>

        {/* espaço para conteúdo das páginas */}
        <div className="content-outlet">
          <Outlet />
        </div>
      </main>
    </Box>
  );
};


const NavItem = ({ icon, label, active, onClick, isCollapsed }) => (
  <Tooltip title={isCollapsed ? label : ''} placement="right">
    <div className={`nav-item ${active}`} onClick={onClick}>
      <div className="nav-icon-wrapper">{icon}</div>
      {!isCollapsed && <span className="nav-text">{label}</span>}
    </div>
  </Tooltip>
);

export default Layout;