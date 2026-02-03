import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./login.css";
import logo from "../assets/logo2.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      // Após login bem-sucedido, redireciona para /maquinas
      navigate("/maquinas");
    } catch (err) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* LADO ESQUERDO (LOGO) */}
        <div className="login-left">
          <div className="logo-placeholder">
            <img
              src={logo}
              alt="Logo da empresa"
              className="logo-image"
            />
          </div>
        </div>

        {/* LADO DIREITO (CARD LOGIN) */}
        <div className="login-right">
          <div className="login-card">

            {/* Ícone placeholder */}
            <div className="icon-placeholder">
              <span>ICONE</span>
            </div>

            {/* FORMULÁRIO */}
            <form className="login-form" onSubmit={handleSubmit}>

              {/* Mensagem de erro */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Insira seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Senha */}
              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Botão */}
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
