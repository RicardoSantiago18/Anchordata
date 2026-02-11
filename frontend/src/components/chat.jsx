import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./chat.css";

// Service
import { sendChatMessage, createChat } from "../services/chat.service";

// MUI Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const maquinaFromState = location.state?.maquina;
  const machineId = id ? String(id) : null;

  const maquinaSelecionada = useMemo(() => {
    if (maquinaFromState) return maquinaFromState;
    if (machineId) {
      return { id: machineId, nome: `Máquina ${machineId}` };
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
    return () => { mounted = false; };
  }, []);

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
      setMessages([]);
      setHasSentMessage(false);
      setInput("");
      if (maquinaSelecionada?.nome) {
        setMessages([{ sender: "system", text: `Você está conversando sobre: ${maquinaSelecionada.nome}` }]);
      }
    } finally {
      setIsCreatingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!chatId || isCreatingChat || !input.trim()) return;
    const userMessage = input;
    setHasSentMessage(true);
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    try {
      const data = await sendChatMessage(chatId, userMessage);
      setMessages((prev) => [...prev, { sender: "bot", text: data.assistant_message }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Erro ao responder. Tente novamente." }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-panel-container">
      {/* Cabeçalho do Chat (Dentro do Painel) */}
      <div className="chat-internal-header">
        <div className="chat-title-info">
           <span className="chat-machine-badge">
             {maquinaSelecionada?.nome || "Chat Geral"}
           </span>
        </div>
        {/*<button className="btn-new-chat-alt" onClick={startNewChat} disabled={isCreatingChat}>
          <AddIcon fontSize="small" /> Novo Chat
        </button>*/}
      </div>

      <main className="chat-main-area">
        <div className="chat-inner">
          {!hasSentMessage && (
            <div className="welcome-section">
              <div className="welcome-icon">
                <PersonOutlineIcon fontSize="large" />
              </div>
              <p className="welcome-text">
                {maquinaSelecionada?.nome 
                  ? `Olá! Vamos falar sobre "${maquinaSelecionada.nome}"?` 
                  : "Olá! Como posso ajudar hoje?"}
              </p>
              <h1 className="main-question">Como podemos te ajudar?</h1>
            </div>
          )}

          {/* Área de Mensagens */}
          <div className={`messages-area ${hasSentMessage ? "active" : ""}`}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Container do Input */}
          <div className={`chat-input-wrapper ${hasSentMessage ? "sticky" : ""}`}>
            <div className="input-box">
              <button className="btn-add" type="button"><AddIcon /></button>
              <input
                type="text"
                placeholder="Pergunte alguma coisa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isCreatingChat}
              />
              <button className="btn-send" onClick={sendMessage} disabled={!chatId || isCreatingChat || !input.trim()}>
                <ArrowUpwardIcon />
              </button>
            </div>
          </div>

          {/* FAQ (Somente no início) */}
          {!isTyping && !hasSentMessage && (
            <div className="faq-section">
              <div className="faq-header">
                <InfoOutlinedIcon fontSize="small" />
                <span>Sugestões</span>
              </div>
              <div className="faq-grid">
                <button className="faq-item">Como fazer a manutenção?</button>
                <button className="faq-item">Ver manual técnico</button>
                <button className="faq-item">Histórico de erros</button>
                <button className="faq-item">Solicitar suporte</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;