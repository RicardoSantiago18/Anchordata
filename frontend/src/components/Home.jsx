import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';

// ÍCONES
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { UserService } from '../services/user.service';
import './Home.css';

const Home = () => {
  const [dadosErros, setDadosErros] = useState([]);
  const [dadosProducao, setDadosProducao] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [maquinasRecentes, setMaquinasRecentes] = useState([]);
  const [statusGeral, setStatusGeral] = useState({ critico: 0, atencao: 0, saudavel: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de delay para carregamento
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dados estáticos para os gráficos (baseados no seu design)
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

        // Busca de usuários (Backend)
        try {
          const data = await UserService.listUsers();
          setUsuarios(data.users || []);
        } catch (err) {
          console.error("Erro ao buscar usuários", err);
        }

        // Busca de máquinas recentes (Backend)
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
          console.error("Erro ao buscar máquinas", err);
        }

        setStatusGeral({ critico: 11, atencao: 7, saudavel: 2 });
        setLoading(false);
      } catch (error) {
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
      <div className="dashboard-grid">
        
        {/* 1. STATUS GERAL (Topo Esquerda) */}
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

        {/* 2. CARD DE USUÁRIOS (Meio Esquerda - Design da Imagem) */}
        <div className="grid-item users-section">
          <ArrowOutwardIcon className="icon-top-right" />
          <ChevronRightIcon className="arrow-next" />
          
          <Typography className="card-title">Usuários</Typography>
          
          <div className="users-list">
            {usuarios.slice(0, 4).length > 0 ? (
              usuarios.slice(0, 4).map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-avatar-box">
                    <PersonOutlineIcon style={{ color: '#000', fontSize: '28px' }} />
                  </div>
                  <Typography className="user-name">{user.name.split(' ')[0]}</Typography>
                  <Typography className="user-role">{user.role || 'Técnico'}</Typography>
                </div>
              ))
            ) : (
              // Placeholder caso não venha do backend
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="user-item">
                  <div className="user-avatar-box"><PersonOutlineIcon /></div>
                  <Typography className="user-name">Usuário</Typography>
                  <Typography className="user-role">Técnico</Typography>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. IDENTIFICAÇÃO DE ERROS (Direita - Ocupa Row 1 e 2) */}
        <div className="grid-item chart-section">
          <Typography variant="h6" align="center" gutterBottom>Identificação de Erros</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosErros}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#000" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#fff', stroke: '#000', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 4. PRODUÇÃO X PARADAS (Base Esquerda) */}
        <div className="grid-item production-section">
          <Typography variant="h6" align="center" gutterBottom>Produção x Paradas</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosProducao}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="prod" fill="#000" radius={[5, 5, 0, 0]} />
              <Bar dataKey="para" fill="#999" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. PROJETOS RECENTES (Base Direita) */}
        <div className="grid-item projects-section">
          <Typography variant="h6" align="center" gutterBottom>Projetos Recentes</Typography>
          <div className="projects-list">
            {maquinasRecentes.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center">Sem interações</Typography>
            ) : (
              maquinasRecentes.map((maq) => (
                <div key={maq.id} className="project-row">
                  <div className="project-img-placeholder">
                    {maq.imagem && (
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/machines/files/${maq.imagem}`} 
                        alt="" 
                        style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
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