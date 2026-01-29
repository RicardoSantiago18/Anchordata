// cadmaq.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  ButtonBase,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

export default function CadMaq() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const maquinas = useMemo(
    () => [
      { id: 1, nome: "impressora 3d" },
      // depois você adiciona mais
    ],
    []
  );

  const filtradas = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return maquinas;
    return maquinas.filter((m) => m.nome.toLowerCase().includes(s));
  }, [maquinas, search]);

  function handleOpenMachine(maquina) {
    // ✅ indo para o chat e levando a máquina selecionada (opcional, mas útil)
    navigate("/chat", { state: { maquina } });
  }

  function handleAddMachine() {
    // por enquanto, só navega (você pode trocar isso por um modal/cadastro depois)
    console.log("Adicionar máquina");
  }

  function goTo(label) {
    const map = {
      "Máquinas": "/maquinas",
      "Relatórios": "/relatorios", // crie a rota depois se quiser
      "Dashboard": "/dashboard",   // crie a rota depois se quiser
      "Configurações": "/configuracoes", // crie a rota depois se quiser
      "Usuários": "/usuarios", // crie a rota depois se quiser
    };

    const route = map[label];
    if (route) navigate(route);
    else console.log("Rota ainda não criada para:", label);
  }

  return (
    <Box sx={sx.page}>
      {/* SIDEBAR */}
      <Box component="aside" sx={sx.sidebar}>
        <Typography sx={sx.brand}>AnchorData</Typography>
        <Divider sx={sx.sidebarDivider} />

        <Box sx={sx.nav}>
          <NavItem active icon={<ViewListIcon />} label="Máquinas" onClick={() => goTo("Máquinas")} />
          <NavItem icon={<DescriptionIcon />} label="Relatórios" onClick={() => goTo("Relatórios")} />
          <NavItem icon={<DashboardIcon />} label="Dashboard" onClick={() => goTo("Dashboard")} />

          <Box sx={{ height: 14 }} />

          <NavItem icon={<SettingsIcon />} label="Configurações" onClick={() => goTo("Configurações")} />
          <NavItem icon={<PeopleAltIcon />} label="Usuários" onClick={() => goTo("Usuários")} />
        </Box>
      </Box>

      {/* CONTEÚDO */}
      <Box component="main" sx={sx.content}>
        <Typography sx={sx.title}>Máquinas cadastradas</Typography>

        <Box sx={sx.searchRow}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar em Máquinas Registradas..."
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "#5f5f5f" }} />
                </InputAdornment>
              ),
            }}
            sx={sx.searchField}
          />
        </Box>

        <Box sx={sx.cardsArea}>
          {filtradas.map((m) => (
            <ButtonBase
              key={m.id}
              onClick={() => handleOpenMachine(m)}
              sx={sx.machineCard}
            >
              <Typography sx={sx.machineText}>{m.nome}</Typography>
            </ButtonBase>
          ))}

          <ButtonBase
            onClick={handleAddMachine}
            aria-label="Adicionar máquina"
            sx={sx.addCircle}
          >
            <AddIcon sx={sx.addIcon} />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        ...sx.navItem,
        ...(active ? sx.navItemActive : null),
      }}
    >
      <Box sx={sx.navIcon}>{icon}</Box>
      <Typography sx={sx.navLabel}>{label}</Typography>
    </ButtonBase>
  );
}

const sx = {
  page: {
    height: "100vh",
    width: "100vw",
    bgcolor: "#d3d3d3",
    display: "flex",
  },

  /* Sidebar */
  sidebar: {
    width: 260,
    bgcolor: "#6f6f6f",
    borderRight: "2px solid #4f4f4f",
    px: 3,
    pt: 3,
    boxSizing: "border-box",
  },
  brand: {
    color: "#eaeaea",
    fontWeight: 800,
    fontSize: 34,
    letterSpacing: 0.3,
    mb: 2,
  },
  sidebarDivider: {
    borderColor: "rgba(255,255,255,0.25)",
    mb: 2,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    mt: 1,
  },
  navItem: {
    width: "100%",
    borderRadius: "10px",
    px: 1.7,
    py: 1.2,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 14,
    bgcolor: "transparent",
    border: "1px solid rgba(255,255,255,0.0)",
    transition: "all .12s ease",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.08)",
    },
  },
  navItemActive: {
    bgcolor: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  navIcon: {
    display: "grid",
    placeItems: "center",
    color: "#e9e9e9",
    "& svg": { fontSize: 22 },
  },
  navLabel: {
    color: "#e9e9e9",
    fontSize: 20,
    fontWeight: 600,
  },

  /* Content */
  content: {
    flex: 1,
    bgcolor: "#cfcfcf",
    borderLeft: "2px solid #8a8a8a",
    px: 6,
    pt: 4,
    boxSizing: "border-box",
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    color: "#5a5a5a",
    letterSpacing: 0.2,
    mb: 3,
  },

  /* Search */
  searchRow: {
    display: "flex",
    justifyContent: "center",
    mb: 6,
  },
  searchField: {
    width: "62%",
    maxWidth: 720,
    "& .MuiOutlinedInput-root": {
      height: 44,
      borderRadius: "6px",
      bgcolor: "#d9d9d9",
      color: "#4f4f4f",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#8a8a8a",
      borderWidth: 2,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#7a7a7a",
    },
    "& .MuiInputBase-input": {
      fontSize: 18,
      px: 1.2,
    },
  },

  /* Cards */
  cardsArea: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    mt: 2,
    ml: 6,
  },
  machineCard: {
    width: 360,
    height: 92,
    borderRadius: "8px",
    bgcolor: "#d9d9d9",
    border: "2px solid #8a8a8a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  machineText: {
    fontSize: 34,
    fontWeight: 700,
    color: "#5a5a5a",
    textTransform: "lowercase",
  },

  addCircle: {
    width: 92,
    height: 92,
    borderRadius: "50%",
    border: "4px solid #5a5a5a",
    display: "grid",
    placeItems: "center",
    bgcolor: "transparent",
  },
  addIcon: {
    fontSize: 46,
    color: "#4a4a4a",
  },
};
