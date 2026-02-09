import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Typography, Button, Divider, IconButton 
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  AutoAwesome, 
  AccessTime, 
  SettingsOutlined, 
  ErrorOutline, 
  InsertPhotoOutlined,
  KeyboardArrowUp, 
  KeyboardArrowDown 
} from '@mui/icons-material';
import './VisualizarMaquina.css';

const VisualizarMaquina = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <section className="main-content-box">
      {/* CABEÇALHO DO CONTEÚDO */}
      <div className="content-header-row">
        <div className="nav-actions">
          <IconButton onClick={() => navigate(-1)} className="action-btn">
            <ArrowBack fontSize="small" />
          </IconButton>
          <IconButton className="action-btn">
            <ArrowForward fontSize="small" />
          </IconButton>
        </div>
        <Typography variant="h5" className="machine-title">Nome Máquina</Typography>
        <IconButton className="action-btn ai-glow">
          <AutoAwesome fontSize="small" />
        </IconButton>
      </div>

      <Divider sx={{ mb: 2 }} />

      <div className="content-body-grid">
        
        {/* coluna da esquerda: nome + descrição */}
        <div className="left-column">
          <div className="image-frame">
            <InsertPhotoOutlined sx={{ fontSize: 60, color: '#333' }} />
          </div>
          
          <div className="info-gray-card">
            <div className="info-header">
              <Typography variant="h6" className="bold-text">Nome da Máquina</Typography>
              <span className="badge-status">Estado</span>
            </div>
            <Typography variant="body2" color="textSecondary">Intensidade de uso: Alta</Typography>
            <div className="info-sub-row">
              <Typography variant="caption" color="textSecondary">Última manutenção: 28/12/2025</Typography>
              <Typography variant="caption" color="textSecondary">Nº Série: HNFDAF323243</Typography>
            </div>
            
            <Typography variant="subtitle2" className="desc-label">Descrição da máquina</Typography>
            <Typography variant="body2" className="desc-text">
              Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel.
            </Typography>
          </div>

          <Button 
            variant="contained" 
            className="chatbot-btn" 
            startIcon={<AutoAwesome />}
            onClick={() => navigate(`/chat/${id}`)}
          >
            Chat Bot
          </Button>
        </div>

        {/* coluna da direita: métricas + timeline */}
        <div className="right-column-container">
          <div className="metrics-row">
            <MetricCard icon={<AccessTime fontSize="inherit"/>} label="MTBF Atual" value="123H" footer="Tempo médio entre as falhas" />
            <MetricCard icon={<SettingsOutlined fontSize="inherit"/>} label="Manutenções" value="08" footer="Últimos 60 dias" />
            <MetricCard icon={<ErrorOutline fontSize="inherit"/>} label="Falhas" value="07" footer="Últimos 60 dias" />
          </div>

          <Typography variant="subtitle2" className="timeline-label">Linha do Tempo:</Typography>
          <div className="timeline-container">
            <div className="timeline-scroll">
              <KeyboardArrowUp fontSize="small" />
              <div className="scroll-bar"><div className="scroll-thumb" /></div>
              <KeyboardArrowDown fontSize="small" />
            </div>
            <div className="timeline-list">
              <TimelineEvent icon={<ErrorOutline color="error" sx={{fontSize: 20}}/>} title="Falha em Fuso Principal" date="12/01/2026" desc="Vibração excessiva detectada" />
              <TimelineEvent icon={<SettingsOutlined sx={{fontSize: 20}}/>} title="Manutenção Corretiva" date="12/01/2026" desc="Troca da peça..." />
              <TimelineEvent icon={<ErrorOutline color="error" sx={{fontSize: 20}}/>} title="Falha no Sistema" date="22/12/2025" desc="Superaquecimento - Parada: 1.5h" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Sub-componentes internos para organização
const MetricCard = ({ icon, label, value, footer }) => (
  <div className="metric-box">
    <div className="metric-label">{icon} {label}</div>
    <div className="metric-val">{value}</div>
    <div className="metric-foot">{footer}</div>
  </div>
);

const TimelineEvent = ({ icon, title, date, desc }) => (
  <div className="event-item">
    <div className="event-icon">{icon}</div>
    <div className="event-card">
      <div className="event-head"><strong>{title}</strong> <span>{date}</span></div>
      <p>{desc}</p>
    </div>
  </div>
);

export default VisualizarMaquina;
