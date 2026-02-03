import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";

import Login from "./components/login";
import CadMaq from "./components/cadmaq";
import Chat from "./components/chat";
import { UserProfile } from "./components/UserProfile";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* rota inicial */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* tela de login (pública) */}
        <Route path="/login" element={<Login />} />

        {/* telas protegidas */}
        <Route
          path="/maquinas"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <CadMaq />
              </>
            </ProtectedRoute>
          }
        />

        {/* chat genérico (protegido) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Chat />
              </>
            </ProtectedRoute>
          }
        />

        {/* chat específico por máquina (protegido) */}
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Chat />
              </>
            </ProtectedRoute>
          }
        />

        {/* perfil do usuário (protegido) */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <UserProfile />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
