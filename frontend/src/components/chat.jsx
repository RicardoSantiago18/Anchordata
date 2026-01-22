import React, { useState } from 'react';
import './chat.css';

// MUI Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const isTyping = input.length > 0;

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Resposta simulada da IA.' }]);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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
          <button className="nav-item active"><HomeOutlinedIcon /></button>
          <button className="nav-item"><FolderOutlinedIcon /></button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout"><LogoutOutlinedIcon /></button>
        </div>
      </aside>

      <div className="main-container">
        {/* Header */}
        <header className="chat-header">
          <div className="user-info">
            <div className="user-avatar"><PersonOutlineIcon /></div>
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
            {/* Título */}
            <div className="chat-title-container">
              <h2 className="chat-title">
                Nome chat <ExpandMoreIcon fontSize="small" />
              </h2>
            </div>

            {/* Conteúdo superior (permanece sempre) */}
            <div className="welcome-section">
              <div className="welcome-icon">
                <PersonOutlineIcon fontSize="large" />
              </div>
              <p className="welcome-text">Olá, Tudo bem?</p>
              <h1 className="main-question">Como podemos te ajudar?</h1>
            </div>

            {/* Input (não se move) */}
            <div className="input-container">
              <div className="input-box">
                <button className="btn-add"><AddIcon /></button>
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

            {/* FAQ — SOME AO DIGITAR */}
            {!isTyping && (
              <div className="faq-section">
                <div className="faq-header">
                  <InfoOutlinedIcon />
                  <span>Dúvidas Frequentes</span>
                </div>
                <div className="faq-grid">
                  <button className="faq-item">a vida é como uma</button>
                  <button className="faq-item">caixa de chocolates</button>
                  <button className="faq-item">você nunca sabe</button>
                  <button className="faq-item">o que pode vir</button>
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
