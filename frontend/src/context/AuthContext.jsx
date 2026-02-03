import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Verificar se há usuário no localStorage ao carregar
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
        isEngineer: user?.role === 'engenheiro',
        isManager: user?.role === 'gerente',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
