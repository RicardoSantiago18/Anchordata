import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { UserService } from '../services/user.service';
import './Home.css';

const Home = () => {
  // estados para o back
  const [dadosErros, setDadosErros] = useState([]);
  const [dadosProducao, setDadosProducao] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [maquinasRecentes, setMaquinasRecentes] = useState([]);
  const [statusGeral, setStatusGeral] = useState({ critico: 0, atencao: 0, saudavel: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulação de chamada de api
    const fetchData = async () => {
      try {
        // simulação de 1s
        await new Promise(resolve => setTimeout(resolve, 1000));

        setDadosErros([
          { name: 'Jan', valor: 5 }, { name: 'Fev', valor: 2 }, { name: 'Mar', valor: 7 },
          { name: 'Abr', valor: 15 }, { name: 'Mai', valor: 14 }, { name: 'Jun', valor: 12 },
          { name: 'Jul', valor: 14 }, { name: 'Ago', valor: 14 }, { name: 'Set', valor: 16 },
          { name: 'Out', valor: 5 }, { name: 'Nov', valor: 11 }, { name: 'Dez', valor: 14 },
        ]);

        setDadosProducao([
          { name: 'Jan', prod: 1000, para: 200 },
          { name: 'Fev', prod: 750, para: 400 },
          { name: 'Mar', prod: 900, para: 180 },
          { name: 'Abr', prod: 900, para: 180 },
        ]);

        try {
          const data = await UserService.listUsers();
          setUsuarios(data.users || []);
        } catch (err) {
          console.error("Erro ao buscar usuários:", err);
          setUsuarios([]);
        }

        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/machines/recent`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const data = await res.json();
            setMaquinasRecentes(data || []);
          }
        } catch (err) {
          console.error("Erro ao buscar máquinas recentes:", err);
          setMaquinasRecentes([]);
        }

        setStatusGeral({ critico: 11, atencao: 7, saudavel: 2 });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <div className="home-dashboard">
      {/* cards de status */}
      <div className="status-row">
        <div className="status-card">
          <span className="status-number">{statusGeral.critico}</span>
          <span className="status-label">Estado Crítico</span>
        </div>
        <div className="status-card">
          <span className="status-number">{statusGeral.atencao}</span>
          <span className="status-label">Atenção</span>
        </div>
        <div className="status-card">
          <span className="status-number">{statusGeral.saudavel}</span>
          <span className="status-label">Estado Saudável</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* 2. card de usuários dinâmico */}
        <div className="grid-item users-section">
          <div className="card-header">
            <Typography variant="h6">Usuários</Typography>
            <ArrowOutwardIcon fontSize="small" className="icon-top-right" />
          </div>
          <div className="users-list">
            {usuarios.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-avatar-box">👤</div>
                <Typography variant="caption" className="user-name">{user.name}</Typography>
                <Typography variant="caption" className="user-role">{user.role}</Typography>
              </div>
            ))}
            <ChevronRightIcon className="arrow-next" />
          </div>
        </div>

        {/* 3. gráfico de erros */}
        <div className="grid-item chart-section">
          <Typography variant="h6" align="center" gutterBottom>Identificações de Erros</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dadosErros}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#333" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#333' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 4. gráfico produçõa x paradas */}
        <div className="grid-item production-section">
          <Typography variant="h6" align="center" gutterBottom>Produção x Paradas</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosProducao}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="prod" fill="#333" radius={[4, 4, 0, 0]} />
              <Bar dataKey="para" fill="#888" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. últimas máquinas interagidas */}
        <div className="grid-item projects-section">
          <Typography variant="h6" align="center" gutterBottom>Máquinas Recentes</Typography>
          <div className="projects-list">
            {maquinasRecentes.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center">Nenhuma interação recente</Typography>
            ) : (
              maquinasRecentes.map((maq) => (
                <div key={maq.id} className="project-row">
                  {maq.imagem ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/machines/files/${maq.imagem}`}
                      alt={maq.nome_maquina}
                      className="project-img-placeholder"
                      style={{ objectFit: 'cover', borderRadius: '6px' }}
                    />
                  ) : (
                    <div className="project-img-placeholder" />
                  )}
                  <div className="project-info">
                    <Typography variant="body2" fontWeight="bold">{maq.nome_maquina}</Typography>
                    <Typography variant="caption" color="textSecondary">N° Série: {maq.num_serie}</Typography>
                  </div>
                  <Chip label={maq.status} size="small" className="status-chip" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;