import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import CadMaq from "./components/cadmaq";
import Chat from "./components/chat";

export default function App() {
  return (
    <Routes>
      {/* rota inicial */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* telas */}
      <Route path="/login" element={<Login />} />
      <Route path="/maquinas" element={<CadMaq />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}
