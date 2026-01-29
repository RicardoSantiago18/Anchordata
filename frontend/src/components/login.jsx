import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../assets/logo2.png";

export default function Login() {
  const navigate = useNavigate();

  // ✅ Agora o login leva para a tela de máquinas
  function handleSubmit(e) {
    e.preventDefault();

    // depois de logar, vai para /maquinas
    navigate("/maquinas");
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
              
              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Insira seu email"
                  required
                />
              </div>

              {/* Senha */}
              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  required
                />
              </div>

              {/* Botão */}
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
