const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthService = {
    /**
     * Faz login do usuário
     */
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
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

            // Armazenar token e dados do usuário
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
     * Obtém os dados do usuário atual do servidor
     */
    getCurrentUser: async () => {
        try {
            const token = AuthService.getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/users/me`, {
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

            const response = await fetch(`${API_URL}/users/change-password`, {
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
