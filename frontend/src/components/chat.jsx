import React from 'react';
import './chat.css';

const Chat = () => {
  return (
    <div className="chat-wrapper">
      {/* Sidebar Esquerda */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-box">Logo</div>
          <button className="sidebar-toggle">
            <span className="arrow">›</span>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <i className="icon-home">🏠</i>
          </button>
          <button className="nav-item">
            <i className="icon-folder">📁</i>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout">
            <i className="icon-logout">↪️</i>
          </button>
        </div>
      </aside>

      <div className="main-container">
        {/* Header Superior */}
        <header className="chat-header">
          <div className="user-info">
            <div className="user-avatar">
              <i className="icon-user">👤</i>
            </div>
            <span className="user-name">nome sobrenome</span>
          </div>
          
          <div className="header-actions">
            <button className="btn-new-chat">
              <span className="plus">+</span> Novo Chat
            </button>
            <button className="btn-notification">
              <i className="icon-bell">🔔</i>
            </button>
          </div>
        </header>

        {/* Área Principal do Chat */}
        <main className="chat-content">
          <div className="chat-inner">
            <div className="chat-title-container">
              <h2 className="chat-title">Nome chat <span className="chevron-down"></span></h2>
            </div>

            <div className="welcome-section">
              <div className="welcome-icon">
                <span className="emoji">😊</span>
              </div>
              <p className="welcome-text">Olá, Tudo bem?</p>
              <h1 className="main-question">Como podemos te ajudar?</h1>
            </div>

            <div className="input-container">
              <div className="input-box">
                <button className="btn-add">+</button>
                <input type="text" placeholder="Pergunte alguma coisa..." />
                <button className="btn-send">↑</button>
              </div>
            </div>

            <div className="faq-section">
              <div className="faq-header">
                <i className="icon-lightbulb">💡</i>
                <span>Dúvidas Frequentes</span>
              </div>
              <div className="faq-grid">
                <button className="faq-item">Lorem Ipsum is simply dummy text of</button>
                <button className="faq-item">Lorem Ipsum is simply dummy text of</button>
                <button className="faq-item">Lorem Ipsum is simply dummy text of</button>
                <button className="faq-item">Lorem Ipsum is simply dummy text of</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;