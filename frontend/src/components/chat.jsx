import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function Chat() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#2f2f2f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Área cinza (fundo do layout) */}
      <Box
        sx={{
          width: "min(1400px, 96vw)",
          height: "min(820px, 88vh)",
          bgcolor: "#7b7b7b",
          borderRadius: 0,
          p: 2,
          display: "flex",
          gap: 2,
        }}
      >
        {/* Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: 86,
            height: "100%",
            bgcolor: "#fff",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 2,
            gap: 2,
            position: "relative",
          }}
        >
          {/* Logo */}
          <Paper
            elevation={0}
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              border: "1px solid #999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "#333",
            }}
          >
            Logo
          </Paper>

          <Divider sx={{ width: "70%" }} />

          {/* Collapse hint (setinha) */}
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              right: -10,
              top: 110,
              width: 22,
              height: 22,
              borderRadius: 2,
              bgcolor: "#e6e6e6",
              border: "1px solid #cfcfcf",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 16, color: "#444" }} />
          </Paper>

          {/* Itens */}
          <IconButton
            sx={{
              width: 50,
              height: 50,
              borderRadius: 3,
              bgcolor: "#e9e9e9",
            }}
          >
            <HomeOutlinedIcon />
          </IconButton>

          <IconButton
            sx={{
              width: 50,
              height: 50,
              borderRadius: 3,
            }}
          >
            <FolderOutlinedIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          {/* Logout */}
          <IconButton
            sx={{
              width: 50,
              height: 50,
              borderRadius: 3,
            }}
          >
            <LogoutOutlinedIcon />
          </IconButton>
        </Paper>

        {/* Coluna principal */}
        <Box
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Topbar */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#fff",
              borderRadius: 4,
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* User pill */}
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 3,
                border: "1px solid #ddd",
                minWidth: 280,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  border: "1px solid #999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonOutlineIcon />
              </Paper>

              <Typography sx={{ color: "#222" }}>Marcelo dos Santos</Typography>
            </Paper>

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 4,
                  px: 2,
                  textTransform: "none",
                  borderColor: "#222",
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                novo chat
              </Button>

              <IconButton
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                }}
              >
                <NotificationsNoneIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Conteúdo do chat */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              bgcolor: "#fff",
              borderRadius: 4,
              p: 2,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Scroll visual */}
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 10,
                width: 10,
                height: "calc(100% - 24px)",
                borderRadius: 6,
                bgcolor: "#ececec",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 60,
                right: 11,
                width: 8,
                height: 130,
                borderRadius: 6,
                bgcolor: "#cfcfcf",
              }}
            />

            {/* Header "Nome chat" */}
            <Box sx={{ textAlign: "center", pt: 1 }}>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#111",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Impressora 3D <ExpandMoreIcon />
              </Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Centro */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                gap: 1.5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  border: "1px solid #999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                impressora 3d
              </Paper>

              <Typography sx={{ color: "#222" }}>Olá, Tudo bem?</Typography>

              <Typography
                sx={{ fontSize: 36, fontWeight: 700, color: "#111" }}
              >
                Como podemos te ajudar?
              </Typography>

              {/* Input */}
              <Box sx={{ width: "min(780px, 92%)", mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Pergunte alguma coisa..."
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "#111",
                            color: "#fff",
                            "&:hover": { bgcolor: "#111" },
                          }}
                        >
                          <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 999,
                      height: 54,
                    },
                  }}
                />
              </Box>

              {/* FAQ */}
              <Box sx={{ width: "min(780px, 92%)", mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoOutlinedIcon sx={{ color: "#111" }} />
                  <Typography sx={{ fontSize: 18, color: "#111" }}>
                    Dúvidas Frequentes
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        bgcolor: "#d9d9d9",
                        borderRadius: 3,
                        px: 2,
                        py: 2.2,
                        color: "#333",
                      }}
                    >
                      Fluminense 2x1 Madureira
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
