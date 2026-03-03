const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
    }
    return data;
}

export const UserService = {
    /** Lista todos os usuários (admin) */
    listUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        return handleResponse(res);
    },

    /** Cria um novo usuário (admin) */
    createUser: async ({ name, email, password, role }) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, email, password, role }),
        });
        return handleResponse(res);
    },

    /** Atualiza nome, cargo e/ou status de um usuário (admin) */
    updateUser: async (id, data) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    /** Remove um usuário (admin) */
    deleteUser: async (id) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(res);
    },
};
