// src/pages/CadUser.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FormHelperText,
  InputLabel,
  Divider,
  Switch,
  Tooltip,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  Snackbar,
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
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { UserService } from "../services/user.service";
import "./caduser.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const ROLE_LABELS = {
  admin: "Administrador",
  engenheiro: "Engenheiro",
  gerente: "Gerente",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "engenheiro" };

// ── component ─────────────────────────────────────────────────────────────────
export default function CadUser() {
  const navigate = useNavigate();

  /* ─ sidebar ─ */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ─ toolbar ─ */
  const [viewMode, setViewMode] = useState("lista");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("recentes");

  /* ─ data ─ */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  /* ─ snackbar feedback ─ */
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  /* ─ modal criar/editar ─ */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = novo
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ─ dialog de exclusão ─ */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await UserService.listUsers();
      // normalise: backend usa `name`, layout usa `nome`
      setUsers(
        (data.users || []).map((u) => ({
          ...u,
          nome: u.name,
          funcao: ROLE_LABELS[u.role] ?? u.role,
          ativo: u.is_active,
        }))
      );
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── filtro + ordenação ───────────────────────────────────────────────────
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
      if (order === "recentes") return 0;
      if (order === "nome_asc") return a.nome.localeCompare(b.nome);
      if (order === "nome_desc") return b.nome.localeCompare(a.nome);
      if (order === "funcao") return a.funcao.localeCompare(b.funcao);
      return 0;
    });
  }, [users, search, order]);

  // ── toggle status ────────────────────────────────────────────────────────
  async function handleToggleStatus(user) {
    try {
      await UserService.updateUser(user.id, { is_active: !user.ativo });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ativo: !u.ativo } : u))
      );
    } catch (err) {
      showSnack(err.message, "error");
    }
  }

  // ── modal helpers ────────────────────────────────────────────────────────
  function openCreate() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowPassword(false);
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({ name: user.nome, email: user.email, password: "", role: user.role });
    setFormErrors({});
    setShowPassword(false);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Nome obrigatório";
    if (!form.email.trim()) errors.email = "Email obrigatório";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Email inválido";
    if (!editingUser && !form.password) errors.password = "Senha obrigatória";
    else if (!editingUser && form.password.length < 6)
      errors.password = "Mínimo de 6 caracteres";
    if (!form.role) errors.role = "Cargo obrigatório";
    return errors;
  }

  async function handleSave() {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        // atualizar
        const payload = { name: form.name, role: form.role };
        await UserService.updateUser(editingUser.id, payload);
        showSnack("Usuário atualizado com sucesso!");
      } else {
        // criar
        await UserService.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        showSnack("Usuário criado com sucesso!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      showSnack(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
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

  // ── render ────────────────────────────────────────────────────────────────
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
            <IconButton
              className="caduser-sidebtn"
              onClick={() => navigate("/maquinas")}
            >
              <HomeOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Projetos" placement="right">
            <IconButton
              className="caduser-sidebtn"
              onClick={() => navigate("/maquinas")}
            >
              <FolderOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Usuários" placement="right">
            <IconButton
              className="caduser-sidebtn active"
              onClick={() => navigate("/usuarios")}
            >
              <PersonOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box className="caduser-sidebar-bottom">
          <Tooltip title="Sair" placement="right">
            <IconButton
              className="caduser-sidebtn"
              onClick={() => navigate("/login")}
            >
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
              <ChevronLeftIcon className={sidebarOpen ? "rot-0" : "rot-180"} />
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
              onClick={openCreate}
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
          {/* Header */}
          <Box className="caduser-header">
            <PersonOutlineIcon className="caduser-header-icon" />
            <Typography className="caduser-header-title">Usuários</Typography>
          </Box>

          <Divider className="caduser-divider" />

          {/* Controls */}
          <Box className="caduser-controls">
            <Box className="caduser-controls-left">
              <Box className="caduser-control">
                <Typography className="caduser-control-label">
                  Visualização
                </Typography>
                <Box className="caduser-viewtoggles">
                  <IconButton
                    className={`caduser-viewbtn ${viewMode === "lista" ? "active" : ""}`}
                    onClick={() => setViewMode("lista")}
                  >
                    <ViewListIcon />
                  </IconButton>
                  <IconButton
                    className={`caduser-viewbtn ${viewMode === "blocos" ? "active" : ""}`}
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
                    <MenuItem value="funcao">Cargo</MenuItem>
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

          {/* List area */}
          <Box className="caduser-list-area">
            {/* Loading */}
            {loading && (
              <Box className="caduser-loading">
                <CircularProgress size={32} />
                <Typography>Carregando usuários...</Typography>
              </Box>
            )}

            {/* API error */}
            {!loading && apiError && (
              <Box className="caduser-empty">
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {apiError}
                </Alert>
              </Box>
            )}

            {/* Data */}
            {!loading && !apiError && (
              <>
                {viewMode === "lista" ? (
                  <Box className="caduser-table">
                    {/* Header */}
                    <Box className="caduser-row caduser-row-head">
                      <Typography className="caduser-col funcionario">
                        Funcionário
                      </Typography>
                      <Typography className="caduser-col email">Email</Typography>
                      <Typography className="caduser-col funcao">Cargo</Typography>
                      <Typography className="caduser-col status">Status</Typography>
                      <Typography className="caduser-col acoes">Ações</Typography>
                    </Box>

                    {/* Rows */}
                    <Box className="caduser-rows">
                      {filteredAndSorted.map((u) => (
                        <Box key={u.id} className="caduser-row caduser-row-body">
                          <Box className="caduser-col funcionario">
                            <Box className="caduser-avatar">
                              <PersonOutlineIcon />
                            </Box>
                            <Typography className="caduser-name">
                              {u.nome}
                            </Typography>
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
                              onChange={() => handleToggleStatus(u)}
                              size="small"
                            />
                          </Box>

                          <Box className="caduser-col acoes">
                            <IconButton
                              className="caduser-action"
                              onClick={() => openEdit(u)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              className="caduser-action danger"
                              onClick={() => setDeleteTarget(u)}
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
                                onChange={() => handleToggleStatus(u)}
                                size="small"
                              />
                            </Box>
                          </Box>

                          <Box className="caduser-card-actions">
                            <IconButton
                              className="caduser-action"
                              onClick={() => openEdit(u)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              className="caduser-action danger"
                              onClick={() => setDeleteTarget(u)}
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
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* ── MODAL CRIAR / EDITAR ─────────────────────────────────────────── */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "caduser-modal-paper" }}
      >
        <DialogTitle className="caduser-modal-title">
          {editingUser ? "Editar Usuário" : "Adicionar Usuário"}
        </DialogTitle>

        <DialogContent className="caduser-modal-content">
          {/* Nome */}
          <TextField
            label="Nome completo"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={!!formErrors.name}
            helperText={formErrors.name}
            fullWidth
            size="small"
            className="caduser-modal-field"
          />

          {/* Email (só na criação) */}
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={!!formErrors.email}
            helperText={formErrors.email}
            fullWidth
            size="small"
            disabled={!!editingUser}
            className="caduser-modal-field"
          />

          {/* Senha (só na criação) */}
          {!editingUser && (
            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              error={!!formErrors.password}
              helperText={formErrors.password}
              fullWidth
              size="small"
              className="caduser-modal-field"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Cargo */}
          <FormControl
            fullWidth
            size="small"
            className="caduser-modal-field"
            error={!!formErrors.role}
          >
            <InputLabel>Cargo</InputLabel>
            <Select
              label="Cargo"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="engenheiro">Engenheiro</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
            </Select>
            {formErrors.role && (
              <FormHelperText>{formErrors.role}</FormHelperText>
            )}
          </FormControl>
        </DialogContent>

        <DialogActions className="caduser-modal-actions">
          <Button
            onClick={closeModal}
            disabled={saving}
            className="caduser-modal-cancel-btn"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            className="caduser-modal-save-btn"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG CONFIRMAR EXCLUSÃO ────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: "caduser-modal-paper" }}
      >
        <DialogTitle className="caduser-modal-title">Remover usuário</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#3a3a3a", fontSize: 14 }}>
            Tem certeza que deseja remover{" "}
            <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="caduser-modal-actions">
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            className="caduser-modal-cancel-btn"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleting}
            variant="contained"
            className="caduser-modal-delete-btn"
            startIcon={
              deleting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {deleting ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ─────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontFamily: "Inter, sans-serif" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
