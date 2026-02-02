import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import CadMaq from "./components/cadmaq";
import Chat from "./components/chat";

export default function App() {
  return (
    <Routes>
      {/* rota inicial */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* telas principais */}
      <Route path="/login" element={<Login />} />

      {/* tela de máquinas */}
      <Route path="/maquinas" element={<CadMaq />} />

      {/* chat genérico (caso queira abrir sem id) */}
      <Route path="/chat" element={<Chat />} />

      {/* ✅ chat específico por máquina */}
      <Route path="/chat/:id" element={<Chat />} />
    </Routes>
  );
}
