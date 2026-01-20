import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/chat");
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left">
          <div className="logo-placeholder">
            <span>LOGO</span>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="icon-placeholder">
              <span>ICONE</span>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Insira seu email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}