import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Divider } from '@mui/material';
import {
  SettingsOutlined, PeopleOutlined, ExitToApp,
  NotificationsNone, HomeOutlined, KeyboardArrowLeft, KeyboardArrowRight
} from '@mui/icons-material';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false); 

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <Box className="app-viewport">
      <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo-wrapper">
          <Box className="sidebar-logo">
            {isCollapsed ? 'L' : 'Logo'}
          </Box>
        </div>
        
        <Divider className="sidebar-divider" />

        {/* Container de navegação */}
        <nav className="sidebar-nav-middle">
          <div className={`nav-item ${isActive('/')}`} onClick={() => navigate('/')}>
            <HomeOutlined className="nav-icon" /> 
            {!isCollapsed && <span>Início</span>}
          </div>
          
          <div 
            className={`nav-item ${location.pathname.includes('maquina') ? 'active' : ''}`} 
            onClick={() => navigate('/maquinas')}
          >
            <SettingsOutlined className="nav-icon" />
            {!isCollapsed && <span>Máquinas</span>}
          </div>
          
          <div className={`nav-item ${isActive('/usuarios')}`} onClick={() => navigate('/usuarios')}>
            <PeopleOutlined className="nav-icon" /> 
            {!isCollapsed && <span>Usuários</span>}
          </div>
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

      <main className="main-layout">
        <header className="topbar-container">
          <div className="user-profile">
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#eee' }}>
              <PeopleOutlined fontSize="small" sx={{ color: '#666' }} />
            </Avatar>
            <Typography variant="body2" className="user-text">nome sobrenome</Typography>
          </div>
          <IconButton size="small"><NotificationsNone fontSize="small" /></IconButton>
        </header>

        <div className="content-outlet">
          <Outlet />
        </div>
      </main>
    </Box>
  );
};

export default Layout;
