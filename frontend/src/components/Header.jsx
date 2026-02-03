import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const getRoleLabel = (role) => {
        const roles = {
            'admin': 'Administrador',
            'engenheiro': 'Engenheiro',
            'gerente': 'Gerente'
        };
        return roles[role] || role;
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-left">
                    <h1 className="header-title">AnchorData</h1>
                </div>

                <div className="header-right">
                    <div className="header-nav">
                        <button onClick={() => navigate('/maquinas')} className="nav-button">
                            Máquinas
                        </button>
                        <button onClick={() => navigate('/perfil')} className="nav-button">
                            Perfil
                        </button>
                    </div>
                    <div className="user-info">
                        <span className="user-name">Bem-vindo, {user.name}!</span>
                        <span className="user-role">({getRoleLabel(user.role)})</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
};
