// src/pages/CadUser.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Divider,
  Switch,
  Tooltip,
  Grid,
} from "@mui/material";

// MUI Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import "./caduser.css";

const seedUsers = [
  {
    id: "u1",
    nome: "Nome Sobrenome",
    email: "nome_sobrenome@gmail.com",
    funcao: "Técnico de Manutenção",
    ativo: true,
  },
  {
    id: "u2",
    nome: "Nome Sobrenome",
    email: "nome_sobrenome@gmail.com",
    funcao: "Administrador",
    ativo: true,
  },
  {
    id: "u3",
    nome: "Nome Sobrenome",
    email: "nome_sobrenome@gmail.com",
    funcao: "Técnico de Manutenção",
    ativo: false,
  },
  {
    id: "u4",
    nome: "Nome Sobrenome",
    email: "nome_sobrenome@gmail.com",
    funcao: "Técnico de Manutenção",
    ativo: true,
  },
  {
    id: "u5",
    nome: "Nome Sobrenome",
    email: "nome_sobrenome@gmail.com",
    funcao: "Técnico de Manutenção",
    ativo: true,
  },
];

export default function CadUser() {
  // Sidebar (fechada no print)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toolbar
  const [viewMode, setViewMode] = useState("lista"); // "lista" | "blocos"
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("recentes"); // recentes | nome_asc | nome_desc | funcao

  // Data
  const [users, setUsers] = useState(seedUsers);

  function handleAddUser() {
    // Placeholder: depois você liga isso em modal/tela de cadastro real
    const newUser = {
      id: `u${Date.now()}`,
      nome: "Novo Usuário",
      email: "novo_usuario@gmail.com",
      funcao: "Administrador",
      ativo: true,
    };
    setUsers((prev) => [newUser, ...prev]);
  }

  function handleToggleStatus(userId) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ativo: !u.ativo } : u))
    );
  }

  function handleEdit(userId) {
    // Placeholder: depois você abre modal/rota de edição
    console.log("Editar:", userId);
  }

  function handleDelete(userId) {
    // Placeholder simples
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = users.filter((u) => {
      if (!q) return true;
      return (
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.funcao.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (order === "recentes") return 0;
      if (order === "nome_asc") return a.nome.localeCompare(b.nome);
      if (order === "nome_desc") return b.nome.localeCompare(a.nome);
      if (order === "funcao") return a.funcao.localeCompare(b.funcao);
      return 0;
    });

    return sorted;
  }, [users, search, order]);

  return (
    <Box className="caduser-wrapper">
      {/* SIDEBAR */}
      <Paper
        elevation={0}
        className={`caduser-sidebar ${sidebarOpen ? "open" : "closed"}`}
      >
        <Box className="caduser-logo-box">Logo</Box>

        <Box className="caduser-sidebar-icons">
          <Tooltip title="Home" placement="right">
            <IconButton className="caduser-sidebtn">
              <HomeOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Projetos" placement="right">
            <IconButton className="caduser-sidebtn">
              <FolderOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Usuários" placement="right">
            <IconButton className="caduser-sidebtn active">
              <PersonOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box className="caduser-sidebar-bottom">
          <Tooltip title="Sair" placement="right">
            <IconButton className="caduser-sidebtn">
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* MAIN */}
      <Box className="caduser-main">
        {/* TOP BAR */}
        <Paper elevation={0} className="caduser-topbar">
          <Box className="caduser-topbar-left">
            <IconButton
              className="caduser-collapse-btn"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              <ChevronLeftIcon
                className={sidebarOpen ? "rot-0" : "rot-180"}
              />
            </IconButton>

            <Box className="caduser-userchip">
              <PersonOutlineIcon className="caduser-userchip-icon" />
              <Typography className="caduser-userchip-text">
                nome sobrenome
              </Typography>
            </Box>
          </Box>

          <Box className="caduser-topbar-right">
            <Button
              className="caduser-add-btn"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
            >
              Adicionar Usuário
            </Button>

            <IconButton className="caduser-notify-btn">
              <NotificationsNoneIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* CONTENT */}
        <Paper elevation={0} className="caduser-content">
          {/* Header da página */}
          <Box className="caduser-header">
            <PersonOutlineIcon className="caduser-header-icon" />
            <Typography className="caduser-header-title">Usuários</Typography>
          </Box>

          <Divider className="caduser-divider" />

          {/* Controles: visualização, ordenar, buscar */}
          <Box className="caduser-controls">
            <Box className="caduser-controls-left">
              <Box className="caduser-control">
                <Typography className="caduser-control-label">
                  Visualização
                </Typography>

                <Box className="caduser-viewtoggles">
                  <IconButton
                    className={`caduser-viewbtn ${
                      viewMode === "lista" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("lista")}
                  >
                    <ViewListIcon />
                  </IconButton>

                  <IconButton
                    className={`caduser-viewbtn ${
                      viewMode === "blocos" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("blocos")}
                  >
                    <GridViewIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box className="caduser-control">
                <Typography className="caduser-control-label">Ordenar</Typography>
                <FormControl size="small" className="caduser-order">
                  <Select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="recentes">Recentes</MenuItem>
                    <MenuItem value="nome_asc">Nome (A-Z)</MenuItem>
                    <MenuItem value="nome_desc">Nome (Z-A)</MenuItem>
                    <MenuItem value="funcao">Função</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box className="caduser-controls-right">
              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar"
                className="caduser-search"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Área de listagem */}
          <Box className="caduser-list-area">
            {viewMode === "lista" ? (
              <Box className="caduser-table">
                {/* Cabeçalho */}
                <Box className="caduser-row caduser-row-head">
                  <Typography className="caduser-col funcionario">
                    Funcionário
                  </Typography>
                  <Typography className="caduser-col email">Email</Typography>
                  <Typography className="caduser-col funcao">Função</Typography>
                  <Typography className="caduser-col status">Status</Typography>
                  <Typography className="caduser-col acoes">Ações</Typography>
                </Box>

                {/* Linhas */}
                <Box className="caduser-rows">
                  {filteredAndSorted.map((u) => (
                    <Box key={u.id} className="caduser-row caduser-row-body">
                      <Box className="caduser-col funcionario">
                        <Box className="caduser-avatar">
                          <PersonOutlineIcon />
                        </Box>
                        <Typography className="caduser-name">{u.nome}</Typography>
                      </Box>

                      <Typography className="caduser-col email">
                        {u.email}
                      </Typography>

                      <Typography className="caduser-col funcao">
                        {u.funcao}
                      </Typography>

                      <Box className="caduser-col status">
                        <Switch
                          checked={u.ativo}
                          onChange={() => handleToggleStatus(u.id)}
                          size="small"
                        />
                      </Box>

                      <Box className="caduser-col acoes">
                        <IconButton
                          className="caduser-action"
                          onClick={() => handleEdit(u.id)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          className="caduser-action danger"
                          onClick={() => handleDelete(u.id)}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}

                  {filteredAndSorted.length === 0 && (
                    <Box className="caduser-empty">
                      <Typography>Nenhum usuário encontrado.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Grid container spacing={2} className="caduser-grid">
                {filteredAndSorted.map((u) => (
                  <Grid item xs={12} sm={6} md={4} lg={4} key={u.id}>
                    <Paper elevation={0} className="caduser-card">
                      <Box className="caduser-card-top">
                        <Box className="caduser-card-avatar">
                          <PersonOutlineIcon />
                        </Box>

                        <Box className="caduser-card-info">
                          <Typography className="caduser-card-name">
                            {u.nome}
                          </Typography>
                          <Typography className="caduser-card-role">
                            {u.funcao}
                          </Typography>
                          <Typography className="caduser-card-email">
                            {u.email}
                          </Typography>
                        </Box>

                        <Box className="caduser-card-status">
                          <Switch
                            checked={u.ativo}
                            onChange={() => handleToggleStatus(u.id)}
                            size="small"
                          />
                        </Box>
                      </Box>

                      <Box className="caduser-card-actions">
                        <IconButton
                          className="caduser-action"
                          onClick={() => handleEdit(u.id)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          className="caduser-action danger"
                          onClick={() => handleDelete(u.id)}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}

                {filteredAndSorted.length === 0 && (
                  <Box className="caduser-empty">
                    <Typography>Nenhum usuário encontrado.</Typography>
                  </Box>
                )}
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
