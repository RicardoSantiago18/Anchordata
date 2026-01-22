import React, { useState, useEffect, useRef } from "react";
import "./chat.css";

// Service
import { sendChatMessage, createChat} from "../services/chat.service";

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
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    async function initChat() {
      const chat = await createChat();
      setChatId(chat.id);
    }
    initChat();
  }, []);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const isTyping = input.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!chatId) {
      return <p style={{ padding: 20 }}>Criando chat...</p>;
    }
    if (!input.trim() || !chatId) return;

    const userMessage = input;

    setHasSentMessage(true);
    setInput("");

    // Mensagem do usuário
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

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

  return (
    <div className="chat-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-box">Logo</div>
          <button className="sidebar-toggle">
            <ChevronLeftIcon fontSize="small" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <HomeOutlinedIcon />
          </button>
          <button className="nav-item">
            <FolderOutlinedIcon />
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout">
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
            <span className="user-name">nome sobrenome</span>
          </div>

          <div className="header-actions">
            <button className="btn-new-chat">
              <AddIcon fontSize="small" /> Novo Chat
            </button>
            <button className="btn-notification">
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
                    Nome chat <ExpandMoreIcon fontSize="small" />
                  </h2>
                </div>

                <div className="welcome-section">
                  <div className="welcome-icon">
                    <PersonOutlineIcon fontSize="large" />
                  </div>
                  <p className="welcome-text">Olá, tudo bem?</p>
                  <h1 className="main-question">
                    Como podemos te ajudar?
                  </h1>
                </div>
              </>
            )}

            {/* Mensagens */}
            <div
              className={`messages-area ${
                hasSentMessage ? "active" : ""
              }`}
            >
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`input-container ${
                hasSentMessage ? "fixed-bottom" : ""
              }`}
            >
              <div className="input-box">
                <button className="btn-add">
                  <AddIcon />
                </button>
                <input
                  type="text"
                  placeholder="Pergunte alguma coisa..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="btn-send" onClick={sendMessage}>
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
                  <button className="faq-item">Exemplo 1</button>
                  <button className="faq-item">Exemplo 2</button>
                  <button className="faq-item">Exemplo 3</button>
                  <button className="faq-item">Exemplo 4</button>
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
