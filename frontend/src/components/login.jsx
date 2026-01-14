import React from "react";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";
import "./login.css";

export default function Login() {
  return (
    <Box className="login-page">
      {/* Área cinza grande de fundo (onde ficam logo + card) */}
      <Box className="login-container">
        {/* "Login" no canto superior esquerdo */}
        <Typography className="login-title">Login</Typography>

        {/* LADO ESQUERDO (LOGO) */}
        <Paper elevation={0} className="login-logo-box">
          <Typography className="login-logo-text">LOGO</Typography>
        </Paper>

        {/* LADO DIREITO (CARD LOGIN COM BORDA AZUL) */}
        <Paper elevation={0} className="login-card">
          <Box className="login-card-content">
            {/* Ícone placeholder */}
            <Box className="login-icon">
              <Typography sx={{ fontSize: 14, letterSpacing: 1 }}>
                ICONE
              </Typography>
            </Box>

            {/* Campos */}
            <TextField
              fullWidth
              placeholder="Usuário"
              variant="outlined"
              className="login-input"
              InputProps={{
                sx: { borderRadius: 3 },
              }}
            />

            <TextField
              fullWidth
              placeholder="Senha"
              type="password"
              variant="outlined"
              className="login-input"
              InputProps={{
                sx: { borderRadius: 3 },
              }}
            />

            {/* Botão */}
            <Button
              fullWidth
              variant="contained"
              disableElevation
              className="login-button"
            >
              Entrar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
