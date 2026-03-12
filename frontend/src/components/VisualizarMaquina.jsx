import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Divider, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
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
  KeyboardArrowDown,
  EditOutlined,
  DeleteOutline
} from '@mui/icons-material';
import './VisualizarMaquina.css';

const VisualizarMaquina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({});

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_URL}/machines/files/${path.replace(/\\/g, '/')}`;
  };

  // ── Edit handlers ──────────────────────────────────────────────
  const openEdit = () => {
    setEditError('');
    setEditForm({
      nome_maquina: machine.nome_maquina || '',
      num_serie: machine.num_serie || '',
      marca: machine.marca || '',
      setor: machine.setor || '',
      data_fabricacao: machine.data_fabricacao
        ? machine.data_fabricacao.substring(0, 10)
        : '',
      fabricante: machine.fabricante || '',
      contato_fabricante: machine.contato_fabricante || '',
      description: machine.description || '',
    });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        formData.append(key, editForm[key]);
      });

      const response = await fetch(`${API_URL}/machines/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao atualizar máquina');
      }

      const updated = await response.json();
      setMachine(updated);
      setEditOpen(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete handlers ────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const response = await fetch(`${API_URL}/machines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok && response.status !== 204) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao remover máquina');
      }

      navigate('/maquinas');
    } catch (err) {
      console.error(err);
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Typography color="error">{error}</Typography></Box>;
  if (!machine) return <Box sx={{ p: 4 }}><Typography>Máquina não encontrada</Typography></Box>;

  return (
    <section className="main-content-box">
      {/* CABEÇALHO DO CONTEÚDO */}
      <div className="content-header-row">
        <div className="nav-actions">
          <IconButton onClick={() => navigate(-1)} className="action-btn">
            <ArrowBack fontSize="small" />
          </IconButton>
        </div>
        <Typography variant="h5" className="machine-title">{machine.nome_maquina}</Typography>
        <div className="header-right-actions">
          <IconButton className="action-btn edit-btn" onClick={openEdit} title="Editar máquina">
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton className="action-btn delete-btn" onClick={() => setDeleteOpen(true)} title="Remover máquina">
            <DeleteOutline fontSize="small" />
          </IconButton>
          <IconButton className="action-btn ai-glow">
            <AutoAwesome fontSize="small" />
          </IconButton>
        </div>
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
                timeline.map(event => {
                  // decide descrição exibida: se for markdown de relatório, não mostrar
                  let descToShow = event.description;
                  if (descToShow && descToShow.startsWith("# Relatório")) {
                    descToShow = null;
                  }
                  return (
                    <TimelineEvent
                      key={event.id}
                      icon={event.event_type === 'failed' ? <ErrorOutline color="error" sx={{ fontSize: 20 }} /> : <SettingsOutlined sx={{ fontSize: 20 }} />}
                      title={event.title}
                      date={new Date(event.created_at).toLocaleDateString()}
                      desc={descToShow}
                      reportUrl={event.extra_data?.report_url}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL DE EDIÇÃO ──────────────────────────────────────── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Máquina</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {editError && <Typography color="error" variant="body2">{editError}</Typography>}
          <TextField label="Nome da Máquina" name="nome_maquina" value={editForm.nome_maquina || ''} onChange={handleEditChange} size="small" fullWidth />
          <TextField label="Número de Série" name="num_serie" value={editForm.num_serie || ''} onChange={handleEditChange} size="small" fullWidth />
          <TextField label="Marca" name="marca" value={editForm.marca || ''} onChange={handleEditChange} size="small" fullWidth />
          <div style={{ display: 'flex', gap: 12 }}>
            <TextField label="Fabricante" name="fabricante" value={editForm.fabricante || ''} onChange={handleEditChange} size="small" fullWidth />
            <TextField label="Setor" name="setor" value={editForm.setor || ''} onChange={handleEditChange} size="small" fullWidth />
          </div>
          <TextField label="Contato do Fabricante" name="contato_fabricante" value={editForm.contato_fabricante || ''} onChange={handleEditChange} size="small" fullWidth />
          <TextField label="Data de Fabricação" name="data_fabricacao" type="date" value={editForm.data_fabricacao || ''} onChange={handleEditChange} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Descrição" name="description" value={editForm.description || ''} onChange={handleEditChange} size="small" fullWidth multiline rows={4} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editLoading}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={editLoading}>
            {editLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIÁLOGO DE CONFIRMAÇÃO DE REMOÇÃO ────────────────────── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Remover Máquina</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja remover a máquina <strong>{machine.nome_maquina}</strong>?
            Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? 'Removendo...' : 'Confirmar Remoção'}
          </Button>
        </DialogActions>
      </Dialog>
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

const TimelineEvent = ({ icon, title, date, desc, reportUrl }) => (
  <div className="event-item">
    <div className="event-icon">{icon}</div>
    <div className="event-card">
      <div className="event-head"><strong>{title}</strong> <span>{date}</span></div>
      {desc && <p>{desc}</p>}
      {reportUrl && (
        <a href={reportUrl} className="timeline-report-link" target="_blank" rel="noopener noreferrer">
          📄 Ver relatório
        </a>
      )}
    </div>
  </div>
);

export default VisualizarMaquina;
