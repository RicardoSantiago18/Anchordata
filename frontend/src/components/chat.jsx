import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./chat.css";

// Service
import { sendChatMessage, createChat } from "../services/chat.service";

// MUI Icons
import group47 from "../assets/Group 47.png";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Componente que exibe texto progressivamente (typewriter)
const StreamingText = ({ text, onComplete, speed = 15 }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isDone) return;
    if (displayedLength >= text.length) {
      setIsDone(true);
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      // Avança mais rápido em espaços e quebras de linha
      const nextChar = text[displayedLength];
      const increment = (nextChar === ' ' || nextChar === '\n') ? 3 : 1;
      setDisplayedLength(prev => Math.min(prev + increment, text.length));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayedLength, text, speed, isDone, onComplete]);

  const visibleText = text.slice(0, displayedLength);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{visibleText || ''}</ReactMarkdown>
  );
};

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const maquinaFromState = location.state?.maquina;
  const machineId = id ? String(id) : null;
  const maintenanceTypeFromState = location.state?.maintenanceType || "corretiva";

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
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFilename, setPdfFilename] = useState(null);
  const [chatMode, setChatMode] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const isTyping = input.length > 0;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Scroll contínuo durante streaming
  useEffect(() => {
    if (streamingIndex !== null) {
      const interval = setInterval(scrollToBottom, 200);
      return () => clearInterval(interval);
    }
  }, [streamingIndex, scrollToBottom]);

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

  const handleStreamingComplete = useCallback(() => {
    setStreamingIndex(null);
  }, []);

  const sendMessage = async () => {
    if (!chatId || isCreatingChat || isWaitingForAI || !input.trim()) return;
    const userMessage = input;
    setHasSentMessage(true);
    setInput("");
    setIsWaitingForAI(true);
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    try {
      const data = await sendChatMessage(chatId, userMessage, false, maquinaSelecionada?.id, maintenanceTypeFromState);
      setIsWaitingForAI(false);
      setMessages((prev) => {
        const newMessages = [...prev, { sender: "bot", text: data.assistant_message, isStreaming: true }];
        setStreamingIndex(newMessages.length - 1);
        return newMessages;
      });

      // Capturar modo da resposta (para transição para "report")
      if (data.mode) {
        setChatMode(data.mode);
      }

      // Se houver pdf_url, armazenar para mostrar botão de download
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url);
        setPdfFilename(data.pdf_filename);
      }
    } catch (error) {
      setIsWaitingForAI(false);
      setMessages((prev) => [...prev, { sender: "bot", text: "Erro ao responder. Tente novamente." }]);
    }
  };

  const generateReport = async () => {
    if (!chatId || !maquinaSelecionada?.id) return;
    setIsGeneratingReport(true);
    try {
      const data = await sendChatMessage(
        chatId,
        "Gerar relatório",
        true, // finalize = true
        maquinaSelecionada.id,
        maintenanceTypeFromState
      );
      setMessages((prev) => [...prev, { sender: "bot", text: data.assistant_message }]);

      // Se houver pdf_url, armazenar para mostrar botão de download
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url);
        setPdfFilename(data.pdf_filename);
      }

      // Limpar modo após gerar relatório
      setChatMode(null);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Erro ao gerar relatório. Tente novamente." }]);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000${pdfUrl}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Falha ao baixar o PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFilename || "relatorio.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
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
                <img src={group47} alt="Ícone" className="welcome-group-icon" />
              </div>
              <p className="welcome-text">
            
              </p>
              <h1 className="main-question">Como podemos te ajudar?</h1>
            </div>
          )}

          {/* Área de Mensagens */}
          <div className={`messages-area ${hasSentMessage ? "active" : ""}`}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.isStreaming && index === streamingIndex ? (
                  <StreamingText
                    text={msg.text || ''}
                    onComplete={handleStreamingComplete}
                  />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text || ''}</ReactMarkdown>
                )}
              </div>
            ))}
            {isWaitingForAI && (
              <div className="message bot thinking-indicator">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Botão para Gerar Relatório */}
          {chatMode === "transition" && !pdfUrl && (
            <div className="report-generation-section">
              <button
                className="btn-generate-report"
                onClick={generateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? "Gerando relatório..." : "📋 Gerar Relatório"}
              </button>
            </div>
          )}

          {/* Botão de Download do PDF */}
          {pdfUrl && (
            <div className="pdf-download-section">
              <button onClick={handleDownloadPdf} className="btn-download-pdf">
                📄 Baixar Relatório PDF
              </button>
            </div>
          )}

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
              <button className="btn-send" onClick={sendMessage} disabled={!chatId || isCreatingChat || isWaitingForAI || !input.trim()}>
                <ArrowUpwardIcon />
              </button>
            </div>
          </div>

          {/* FAQ (Somente no início) */}
          {!isTyping && !hasSentMessage && (
            <div className="faq-section">
              <div className="faq-header">
                <InfoOutlinedIcon fontSize="small" />
                <span>Dúvidas Frequentes</span>
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