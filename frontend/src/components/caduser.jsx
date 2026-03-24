import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, IconButton, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, Divider, Switch, Grid, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, InputLabel
} from "@mui/material";

// Ícones
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { UserService } from "../services/user.service";
import "./caduser.css";

const ROLE_LABELS = {
  admin: "Administrador",
  engenheiro: "Engenheiro",
  gerente: "Gerente",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "engenheiro" };

export default function CadUser() {
  // --- Estados de Interface ---
  const [viewMode, setViewMode] = useState("lista");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("recentes");
  const [showPassword, setShowPassword] = useState(false);

  // --- Estados de Dados ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // --- Estados de Feedback & Modais ---
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  // --- Lógica de Busca  ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await UserService.listUsers();
      setUsers((data.users || []).map((u) => ({
        ...u,
        nome: u.name,
        funcao: ROLE_LABELS[u.role] ?? u.role,
        ativo: u.is_active,
      })));
    } catch (err) {
      setApiError(err.message);
      showSnack(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // --- Filtro e Ordenação ---
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
    return [...filtered].sort((a, b) => {
      if (order === "nome_asc") return a.nome.localeCompare(b.nome);
      if (order === "nome_desc") return b.nome.localeCompare(a.nome);
      if (order === "funcao") return a.funcao.localeCompare(b.funcao);
      return 0;
    });
  }, [users, search, order]);

  // --- Validação de Formulário ---
  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Nome obrigatório";
    if (!form.email.trim()) errors.email = "Email obrigatório";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Email inválido";
    if (!editingUser && !form.password) errors.password = "Senha obrigatória";
    else if (!editingUser && form.password.length < 6) errors.password = "Mínimo 6 caracteres";
    if (!form.role) errors.role = "Cargo obrigatório";
    return errors;
  }

  // --- Handlers de Ação ---
  async function handleSave() {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser.id, { name: form.name, role: form.role });
        showSnack("Usuário atualizado!");
      } else {
        await UserService.createUser(form);
        showSnack("Usuário criado!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      showSnack(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await UserService.deleteUser(deleteTarget.id);
      showSnack("Usuário removido.");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showSnack(err.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleStatus(user) {
    try {
      await UserService.updateUser(user.id, { is_active: !user.ativo });
      fetchUsers();
    } catch (err) { showSnack(err.message, "error"); }
  }

  // --- Abertura de Modais ---
  function openCreate() {
    setEditingUser(null); setForm(EMPTY_FORM); setFormErrors({}); setShowPassword(false); setModalOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({ name: user.nome, email: user.email, password: "", role: user.role });
    setFormErrors({}); setShowPassword(false); setModalOpen(true);
  }

  // mudança na tela de usuários do botão de adicionar máquina para o botão de adicionar usuário
  useEffect(() => {
    const handleOpenModal = () => openCreate();
    
    window.addEventListener("open-user-modal", handleOpenModal);
    return () => window.removeEventListener("open-user-modal", handleOpenModal);
  }, [openCreate]);

  return (
    <Box className="caduser-content-container">
      {/* Header e Título */}
      <Box className="caduser-page-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonOutlineIcon sx={{ color: '#006AFF' }} />
          <Typography variant="h5" fontWeight="700" sx={{ color: '#006AFF' }}>Usuários</Typography>
        </Box>
      </Box>

      <Paper elevation={0} className="caduser-main-paper">
        {/* Controles: Busca, Ordenação e View Mode */}
        <Box className="caduser-controls">
          <Box className="caduser-controls-left">
            <Box className="caduser-viewtoggles">
              <IconButton className={viewMode === "lista" ? "active" : ""} onClick={() => setViewMode("lista")}><ViewListIcon /></IconButton>
              <IconButton className={viewMode === "blocos" ? "active" : ""} onClick={() => setViewMode("blocos")}><GridViewIcon /></IconButton>
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={order} onChange={(e) => setOrder(e.target.value)}>
                <MenuItem value="recentes">Recentes</MenuItem>
                <MenuItem value="nome_asc">Nome (A-Z)</MenuItem>
                <MenuItem value="nome_desc">Nome (Z-A)</MenuItem>
                <MenuItem value="funcao">Cargo</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField
            size="small"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Área da Lista (Layout Cinza que você gosta) */}
        <Box className="caduser-list-wrapper">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress color="inherit" /></Box>
          ) : apiError ? (
            <Alert severity="error">{apiError}</Alert>
          ) : (
            viewMode === "lista" ? (
              <div className="caduser-table">
                <div className="table-head">
                  <span>Nome</span>
                  <span>Email</span>
                  <span>Cargo</span>
                  <span>Status</span>
                  <span style={{ textAlign: 'right' }}>Ações</span>
                </div>
                {filteredAndSorted.map(u => (
                  <div key={u.id} className="table-row">
                    <div className="user-cell">
                       <div className="mini-avatar"><PersonOutlineIcon fontSize="small"/></div>
                       <span>{u.nome}</span>
                    </div>
                    <span className="email-cell">{u.email}</span>
                    <span>{u.funcao}</span>
                    <Switch checked={u.ativo} onChange={() => handleToggleStatus(u)} size="small" />
                    <div className="actions-cell">
                      <IconButton size="small" onClick={() => openEdit(u)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Grid container spacing={2}>
                {filteredAndSorted.map(u => (
                  <Grid item xs={12} sm={6} md={4} key={u.id}>
                    <Paper className="user-grid-card">
                       <Typography fontWeight="700">{u.nome}</Typography>
                       <Typography variant="body2">{u.email}</Typography>
                       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span className="role-tag">{u.funcao}</span>
                         <IconButton size="small" onClick={() => openEdit(u)}><EditOutlinedIcon fontSize="small"/></IconButton>
                       </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )
          )}
        </Box>
      </Paper>

      {/* Modal Criar/Editar (Completo) */}
      <Dialog open={modalOpen} onClose={() => !saving && setModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nome Completo" fullWidth value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} error={!!formErrors.name} helperText={formErrors.name} />
          <TextField label="E-mail" fullWidth value={form.email} disabled={!!editingUser} onChange={(e) => setForm({...form, email: e.target.value})} error={!!formErrors.email} helperText={formErrors.email} />
          {!editingUser && (
            <TextField 
              label="Senha" 
              type={showPassword ? "text" : "password"} 
              fullWidth 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              error={!!formErrors.password} 
              helperText={formErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
          <FormControl fullWidth>
            <InputLabel>Cargo</InputLabel>
            <Select label="Cargo" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="engenheiro">Engenheiro</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" className="btn-primary-black" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Excluir Usuário?</DialogTitle>
        <DialogContent>Tem certeza que deseja remover {deleteTarget?.nome}? Esta ação não pode ser desfeita.</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({...snack, open: false})}>
        <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}