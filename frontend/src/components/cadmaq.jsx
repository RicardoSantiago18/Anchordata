// src/pages/CadMaq.jsx
import React, { useMemo, useState } from "react";
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
  // ✅ 1) navegação
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("recentes");

  // Mock
  const machines = useMemo(
    () => [
      { id: 1, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 2, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 3, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 4, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
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

    if (order === "a-z") list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
    if (order === "z-a") list = [...list].sort((a, b) => b.nome.localeCompare(a.nome));

    return list;
  }, [machines, search, order]);

  // ✅ 2) funções de navegação (CLARAS)
  const goHome = () => navigate("/maquinas");
  const goUsers = () => navigate("/usuarios");
  const enterMachine = (id) => navigate(`/chat/${id}`);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#d3d3d3", p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 16px)" }}>

        {/* SIDEBAR */}
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

          {/* ÍCONES */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mt: 2 }}>
            {/* Home */}
            <IconButton aria-label="Home" onClick={goHome}>
              <HomeOutlinedIcon />
            </IconButton>

            {/* Máquinas (ativo) */}
            <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: "#eee" }}>
              <IconButton aria-label="Máquinas" onClick={goHome}>
                <FolderOutlinedIcon />
              </IconButton>
            </Paper>

            {/* 👤 Usuários (BONEQUINHO) */}
            <IconButton aria-label="Usuários" onClick={goUsers}>
              <PersonOutlineIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* ÁREA PRINCIPAL */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* TOPBAR */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: 1.2, display: "flex", gap: 1.5 }}>
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
              <PersonOutlineIcon fontSize="small" />
              <Typography sx={{ color: "#444" }}>nome sobrenome</Typography>
            </Paper>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 999, textTransform: "none" }}
            >
              Adicionar Máquina
            </Button>

            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
          </Paper>

          {/* CONTEÚDO */}
          <Paper elevation={0} sx={{ flex: 1, borderRadius: 3, p: 2 }}>
            <Typography variant="h5" textAlign="center">
              Máquinas
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {filteredMachines.map((m) => (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #ccc" }}>
                    <CardContent>
                      <Typography fontWeight={600}>{m.nome}</Typography>
                      <Typography fontSize={12}>Nº Série: {m.serie}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => enterMachine(m.id)} // ✅ CHAT
                        endIcon={<ArrowForwardIosIcon fontSize="small" />}
                        sx={{ borderRadius: 999, bgcolor: "#e0e0e0", color: "#000" }}
                      >
                        Entrar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
