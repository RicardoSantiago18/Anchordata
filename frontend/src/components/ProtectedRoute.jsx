import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Carregando...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Verificar role específica
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return <Navigate to="/maquinas" replace />;
    }

    // Verificar múltiplas roles
    if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.includes(user.role) || user.role === 'admin';
        if (!hasRequiredRole) {
            return <Navigate to="/maquinas" replace />;
        }
    }

    return children;
};
