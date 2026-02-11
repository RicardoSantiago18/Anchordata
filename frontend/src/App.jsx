import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
import AdicionarMaquina from "./components/AdicionarMaquina";
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

        {/* Tela de login  */}
        <Route path="/login" element={<Login />} />

        {/* rotas que usam o layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* conteúdo que será injetado dentro do outlet do layout */}
          <Route path="/maquinas" element={<CadMaq />} />
          <Route path="/maquinas/adicionar" element={<AdicionarMaquina />} />
          <Route path="/visualizarmaquina" element={<VisualizarMaquina />} />
          <Route path="/visualizarmaquina/:id" element={<VisualizarMaquina />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/perfil" element={<UserProfile />} />
        </Route>

        {/* rotas que continuam com o header usando antes */}
        <Route
          path="/maquinas"
          element={
            <ProtectedRoute>
              <>
                
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
                
                <UserProfile />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}