import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Divider, IconButton, CircularProgress
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
  const [machine, setMachine] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machineRes, timelineRes] = await Promise.all([
          fetch(`${API_URL}/machines/${id}`),
          fetch(`${API_URL}/machines/${id}/timeline`)
        ]);

        if (!machineRes.ok) throw new Error('Falha ao carregar dados da máquina');

        const machineData = await machineRes.json();
        setMachine(machineData);

        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setTimeline(timelineData);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_URL]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Typography color="error">{error}</Typography></Box>;
  if (!machine) return <Box sx={{ p: 4 }}><Typography>Máquina não encontrada</Typography></Box>;

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_URL}/machines/files/${path.replace(/\\/g, '/')}`;
  };

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
        <Typography variant="h5" className="machine-title">{machine.nome_maquina}</Typography>
        <IconButton className="action-btn ai-glow">
          <AutoAwesome fontSize="small" />
        </IconButton>
      </div>

      <Divider sx={{ mb: 2 }} />

      <div className="content-body-grid">

        {/* coluna da esquerda: nome + descrição */}
        <div className="left-column">
          <div className="image-frame" style={machine.imagem ? { backgroundImage: `url(${getImageUrl(machine.imagem)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!machine.imagem && <InsertPhotoOutlined sx={{ fontSize: 60, color: '#333' }} />}
          </div>

          <div className="info-gray-card">
            <div className="info-header">
              <Typography variant="h6" className="bold-text">{machine.nome_maquina}</Typography>
              <span className={`badge-status ${machine.status === 'Regime Saudável' ? 'status-ok' : 'status-warning'}`}>{machine.status}</span>
            </div>
            {/* Mocked intensity for now */}
            <Typography variant="body2" color="textSecondary">Intensidade de uso: Média</Typography>
            <div className="info-sub-row">
              <Typography variant="caption" color="textSecondary">Fab: {new Date(machine.data_fabricacao).toLocaleDateString()}</Typography>
              <Typography variant="caption" color="textSecondary">Nº Série: {machine.num_serie}</Typography>
            </div>

            <Typography variant="subtitle2" className="desc-label">Descrição da máquina</Typography>
            <Typography variant="body2" className="desc-text">
              {machine.description}
            </Typography>

            {machine.manual && (
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                href={getImageUrl(machine.manual)}
                target="_blank"
              >
                Ver Manual
              </Button>
            )}
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
            {/* Metrics are still mocked/calculated on backend but not available in simple get yet, using placeholders */}
            <MetricCard icon={<AccessTime fontSize="inherit" />} label="MTBF Atual" value="--" footer="Tempo médio entre as falhas" />
            <MetricCard icon={<SettingsOutlined fontSize="inherit" />} label="Manutenções" value="--" footer="Últimos 60 dias" />
            <MetricCard icon={<ErrorOutline fontSize="inherit" />} label="Falhas" value="--" footer="Últimos 60 dias" />
          </div>

          <Typography variant="subtitle2" className="timeline-label">Linha do Tempo:</Typography>
          <div className="timeline-container">
            <div className="timeline-scroll">
              <KeyboardArrowUp fontSize="small" />
              <div className="scroll-bar"><div className="scroll-thumb" /></div>
              <KeyboardArrowDown fontSize="small" />
            </div>
            <div className="timeline-list">
              {timeline.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>Nenhum evento registrado.</Typography>
              ) : (
                timeline.map(event => (
                  <TimelineEvent
                    key={event.id}
                    icon={event.event_type === 'failed' ? <ErrorOutline color="error" sx={{ fontSize: 20 }} /> : <SettingsOutlined sx={{ fontSize: 20 }} />}
                    title={event.title}
                    date={new Date(event.created_at).toLocaleDateString()}
                    desc={event.description}
                  />
                ))
              )}
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
