// src/pages/CadMaq.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADICIONADO
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
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
} from "@mui/material";

// MUI Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function CadMaq() {
  const navigate = useNavigate(); // ✅ ADICIONADO

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("recentes");

  // Mock (trocar depois por dados reais)
  const machines = useMemo(
    () => [
      { id: 1, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 2, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 3, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 4, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 5, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 6, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 7, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 8, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
    ],
    []
  );

  const filteredMachines = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = machines.filter((m) => {
      if (!q) return true;
      return (
        m.nome.toLowerCase().includes(q) ||
        m.serie.toLowerCase().includes(q) ||
        (m.estado || "").toLowerCase().includes(q)
      );
    });

    // Ordenações simples (placeholder)
    if (order === "a-z") list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
    if (order === "z-a") list = [...list].sort((a, b) => b.nome.localeCompare(a.nome));

    return list;
  }, [machines, search, order]);

  const handleAddMachine = () => {
    // TODO: abrir modal / navegar para formulário de cadastro
    console.log("Adicionar Máquina");
  };

  const handleEnterMachine = (id) => {
    // ✅ AGORA NAVEGA PARA O CHAT DA MÁQUINA
    navigate(`/chat/${id}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#d3d3d3",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 16px)" }}>
        {/* Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: 68,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 2,
            position: "relative",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              border: "1px solid #ddd",
              display: "grid",
              placeItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 12 }}>Logo</Typography>
          </Paper>

          {/* Botão de recolher */}
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              right: -14,
              top: 74,
              bgcolor: "#fff",
              border: "1px solid #ddd",
              width: 26,
              height: 26,
              "&:hover": { bgcolor: "#fff" },
            }}
            aria-label="Recolher sidebar"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mt: 2 }}>
            <IconButton aria-label="Home">
              <HomeOutlinedIcon />
            </IconButton>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: "#eee",
                display: "grid",
                placeItems: "center",
              }}
            >
              <IconButton aria-label="Máquinas">
                <FolderOutlinedIcon />
              </IconButton>
            </Paper>

            <IconButton aria-label="Usuários">
              <PersonOutlineIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Área principal */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Topbar */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* User */}
            <Paper
              elevation={0}
              sx={{
                px: 1.2,
                py: 0.9,
                borderRadius: 2,
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  border: "1px solid #ddd",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <PersonOutlineIcon fontSize="small" />
              </Paper>

              <Typography sx={{ color: "#444" }}>nome sobrenome</Typography>
            </Paper>

            {/* Botão adicionar */}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddMachine}
              sx={{ borderRadius: 999, textTransform: "none", px: 2 }}
            >
              Adicionar Máquina
            </Button>

            {/* Sino */}
            <IconButton aria-label="Notificações">
              <NotificationsNoneIcon />
            </IconButton>
          </Paper>

          {/* Conteúdo interno (card grande) */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 2.2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Typography variant="h5" sx={{ textAlign: "center", mb: 1 }}>
              Máquinas
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Linha: Ordenar + Buscar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#444" }}>Ordenar</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select value={order} onChange={(e) => setOrder(e.target.value)} displayEmpty>
                    <MenuItem value="recentes">Recentes</MenuItem>
                    <MenuItem value="a-z">A-Z</MenuItem>
                    <MenuItem value="z-a">Z-A</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <TextField
                  size="small"
                  placeholder="Buscar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: "50%", minWidth: 260 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Lista de cards (com scroll) */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#e5e5e5",
                borderRadius: 3,
                p: 2,
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
              }}
            >
              <Grid container spacing={2}>
                {filteredMachines.map((m) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={m.id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid #d2d2d2",
                        overflow: "hidden",
                      }}
                    >
                      {/* topo: estado */}
                      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
                        <Chip
                          size="small"
                          label={m.estado || "Estado"}
                          variant="outlined"
                          sx={{ bgcolor: "#f3f3f3" }}
                        />
                      </Box>

                      {/* imagem placeholder */}
                      <Box
                        sx={{
                          height: 110,
                          display: "grid",
                          placeItems: "center",
                          px: 2,
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 2,
                            border: "1px solid #d7d7d7",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ImageOutlinedIcon />
                          </Box>
                        </Paper>
                      </Box>

                      {/* base cinza com infos */}
                      <Box sx={{ bgcolor: "#bdbdbd", mt: 1 }}>
                        <CardContent sx={{ pb: 1.2 }}>
                          <Typography sx={{ fontWeight: 600 }}>{m.nome}</Typography>
                          <Typography sx={{ fontSize: 12, color: "#333", mt: 0.5 }}>
                            Nº Série: {m.serie}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ pb: 1.8, px: 2 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleEnterMachine(m.id)} // ✅ AGORA VAI PRA ROTA
                            endIcon={<ArrowForwardIosIcon fontSize="small" />}
                            sx={{
                              borderRadius: 999,
                              textTransform: "none",
                              bgcolor: "#e0e0e0",
                              color: "#000",
                              boxShadow: "none",
                              "&:hover": { bgcolor: "#dadada", boxShadow: "none" },
                            }}
                          >
                            Entrar
                          </Button>
                        </CardActions>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
