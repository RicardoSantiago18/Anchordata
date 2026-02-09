import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";

import Login from "./components/login";
import CadMaq from "./components/cadmaq";
import Chat from "./components/chat";
import { UserProfile } from "./components/UserProfile";
import CadUser from "./components/caduser";
import VisualizarMaquina from "./components/visualizarmaquina";
import Layout from "./components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota inicial */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Tela de login (pública) */}
        <Route path="/login" element={<Login />} />

        {/* ROTAS QUE USAM O NOVO LAYOUT (SIDEBAR + TOPBAR) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* O conteúdo destas rotas será injetado no <Outlet /> dentro do Layout */}
          <Route path="/visualizarmaquina" element={<VisualizarMaquina />} />
          <Route path="/visualizarmaquina/:id" element={<VisualizarMaquina />} />
        </Route>

        {/* ROTAS QUE CONTINUAM COM O HEADER ANTIGO */}
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

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <CadUser />
              </>
            </ProtectedRoute>
          }
        />

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