import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // ✅ agora inclui useParams
import "./chat.css";

// Service
import { sendChatMessage, createChat } from "../services/chat.service";

// MUI Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // ✅ pega o :id da rota /chat/:id

  // ✅ 1) se vier máquina pelo state, usa ela
  const maquinaFromState = location.state?.maquina; // { id, nome } (ou undefined)

  // ✅ 2) id da máquina vindo da URL (sempre string) -> converte pra string mesmo
  const machineId = id ? String(id) : null;

  // ✅ 3) Define "maquinaSelecionada" de forma robusta:
  // - prioriza state (tem nome, etc.)
  // - se não tiver state, cria um objeto mínimo usando o id da URL
  const maquinaSelecionada = useMemo(() => {
    if (maquinaFromState) return maquinaFromState;

    if (machineId) {
      return {
        id: machineId,
        nome: `Máquina ${machineId}`,
      };
    }

    return undefined;
  }, [maquinaFromState, machineId]);

  const [chatId, setChatId] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const isTyping = input.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // ✅ cria chat ao entrar na tela
  useEffect(() => {
    let mounted = true;

    async function initChat() {
      try {
        setIsCreatingChat(true);
        const chat = await createChat();
        if (!mounted) return;

        setChatId(chat.id);
      } finally {
        if (mounted) setIsCreatingChat(false);
      }
    }

    initChat();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ se tiver máquina selecionada (via state OU via id), coloca uma mensagem inicial (opcional)
  useEffect(() => {
    if (!maquinaSelecionada?.nome) return;

    const texto = `Você está conversando sobre: ${maquinaSelecionada.nome}`;
    setMessages((prev) => {
      const jaTem = prev.some((m) => m.sender === "system" && m.text === texto);
      if (jaTem) return prev;
      return [...prev, { sender: "system", text: texto }];
    });
  }, [maquinaSelecionada]);

  const startNewChat = async () => {
    try {
      setIsCreatingChat(true);
      const chat = await createChat();
      setChatId(chat.id);

      // reseta o visual
      setMessages([]);
      setHasSentMessage(false);
      setInput("");

      // mantém o contexto da máquina se existir
      if (maquinaSelecionada?.nome) {
        setMessages([
          {
            sender: "system",
            text: `Você está conversando sobre: ${maquinaSelecionada.nome}`,
          },
        ]);
      }
    } finally {
      setIsCreatingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!chatId || isCreatingChat) return;
    if (!input.trim()) return;

    const userMessage = input;

    setHasSentMessage(true);
    setInput("");

    // Mensagem do usuário
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      const data = await sendChatMessage(chatId, userMessage);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.assistant_message },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Erro ao responder. Tente novamente." },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGoHome = () => {
    navigate("/maquinas");
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="chat-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-box">Logo</div>
          <button className="sidebar-toggle" type="button">
            <ChevronLeftIcon fontSize="small" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            type="button"
            onClick={handleGoHome}
            title="Voltar para Máquinas"
          >
            <HomeOutlinedIcon />
          </button>

          <button className="nav-item" type="button" title="Pastas (em breve)">
            <FolderOutlinedIcon />
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item logout"
            type="button"
            onClick={handleLogout}
            title="Sair"
          >
            <LogoutOutlinedIcon />
          </button>
        </div>
      </aside>

      <div className="main-container">
        {/* Header */}
        <header className="chat-header">
          <div className="user-info">
            <div className="user-avatar">
              <PersonOutlineIcon />
            </div>

            {/* ✅ agora mostra nome da máquina (state ou fallback pelo id) */}
            <span className="user-name">
              {maquinaSelecionada?.nome
                ? maquinaSelecionada.nome
                : machineId
                ? `Máquina ${machineId}`
                : "nome sobrenome"}
            </span>
          </div>

          <div className="header-actions">
            <button
              className="btn-new-chat"
              type="button"
              onClick={startNewChat}
              disabled={isCreatingChat}
              title="Criar um novo chat"
            >
              <AddIcon fontSize="small" /> Novo Chat
            </button>

            <button className="btn-notification" type="button">
              <NotificationsNoneIcon />
            </button>
          </div>
        </header>

        {/* Chat */}
        <main className="chat-content">
          <div className="chat-inner">
            {!hasSentMessage && (
              <>
                <div className="chat-title-container">
                  <h2 className="chat-title">
                    {maquinaSelecionada?.nome
                      ? maquinaSelecionada.nome
                      : machineId
                      ? `Máquina ${machineId}`
                      : "Nome chat"}{" "}
                    <ExpandMoreIcon fontSize="small" />
                  </h2>
                </div>

                <div className="welcome-section">
                  <div className="welcome-icon">
                    <PersonOutlineIcon fontSize="large" />
                  </div>
                  <p className="welcome-text">
                    {maquinaSelecionada?.nome
                      ? `Olá! Vamos falar sobre "${maquinaSelecionada.nome}"?`
                      : machineId
                      ? `Olá! Vamos falar sobre a máquina ${machineId}?`
                      : "Olá, tudo bem?"}
                  </p>
                  <h1 className="main-question">Como podemos te ajudar?</h1>
                </div>
              </>
            )}

            {/* Mensagens */}
            <div className={`messages-area ${hasSentMessage ? "active" : ""}`}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender}`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.text}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`input-container ${hasSentMessage ? "fixed-bottom" : ""}`}>
              <div className="input-box">
                <button className="btn-add" type="button" title="Anexar (em breve)">
                  <AddIcon />
                </button>

                <input
                  type="text"
                  placeholder={
                    maquinaSelecionada?.nome
                      ? `Pergunte algo sobre ${maquinaSelecionada.nome}...`
                      : machineId
                      ? `Pergunte algo sobre a máquina ${machineId}...`
                      : "Pergunte alguma coisa..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isCreatingChat}
                />

                <button
                  className="btn-send"
                  type="button"
                  onClick={sendMessage}
                  disabled={!chatId || isCreatingChat || !input.trim()}
                  title="Enviar"
                >
                  <ArrowUpwardIcon />
                </button>
              </div>
            </div>

            {/* FAQ */}
            {!isTyping && !hasSentMessage && (
              <div className="faq-section">
                <div className="faq-header">
                  <InfoOutlinedIcon />
                  <span>Dúvidas Frequentes</span>
                </div>
                <div className="faq-grid">
                  <button className="faq-item" type="button">
                    Exemplo 1
                  </button>
                  <button className="faq-item" type="button">
                    Exemplo 2
                  </button>
                  <button className="faq-item" type="button">
                    Exemplo 3
                  </button>
                  <button className="faq-item" type="button">
                    Exemplo 4
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
