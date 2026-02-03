import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../services/auth.service';
import './UserProfile.css';

export const UserProfile = () => {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await AuthService.changePassword(currentPassword, newPassword);
            setSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const roles = {
            'admin': 'Administrador',
            'engenheiro': 'Engenheiro',
            'gerente': 'Gerente'
        };
        return roles[role] || role;
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Perfil do Usuário</h2>

                <div className="profile-info">
                    <div className="info-item">
                        <label>Nome:</label>
                        <span>{user.name}</span>
                    </div>

                    <div className="info-item">
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>

                    <div className="info-item">
                        <label>Função:</label>
                        <span className="role-badge">{getRoleLabel(user.role)}</span>
                    </div>

                    <div className="info-item">
                        <label>Status:</label>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>

                <div className="password-section">
                    <h3>Alterar Senha</h3>

                    <form onSubmit={handleChangePassword}>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <div className="form-group">
                            <label>Senha Atual:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nova Senha:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirmar Nova Senha:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="change-password-btn" disabled={loading}>
                            {loading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
