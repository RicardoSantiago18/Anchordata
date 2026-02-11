import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid
} from "@mui/material";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Importação do CSS padronizado
import "./cadmaq.css";

export default function CadMaq() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Mock de dados para exibição
  const machines = useMemo(
    () => [
      { id: 1, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 2, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 3, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 4, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 5, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
      { id: 6, nome: "Nome da Máquina", serie: "HNFDAF323243", estado: "Estado" },
    ],
    []
  );

  // ✅ Função de redirecionamento para a página de detalhes
  const enterMachine = (id) => {
    navigate(`/visualizarmaquina/${id}`);
  };

  return (
    <Box className="cadmaq-panel">
      {/* Cabeçalho interno da página */}
      <Box className="cadmaq-header">
        <Typography variant="h5" className="cadmaq-title">
          Máquinas
        </Typography>
        
        {/*<Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-machine-btn"
          onClick={() => console.log("Adicionar nova máquina")}
        >
          Adicionar Máquina
        </Button>*/}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Grid de Máquinas dentro do container cinza */}
      <Box className="cadmaq-list-container">
        <Grid container spacing={3}>
          {machines.map((m) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={m.id}>
              <Card elevation={0} className="machine-card">
                
                {/* Placeholder de Imagem/Ícone */}
                <Box className="machine-image-placeholder">
                  <ImageOutlinedIcon sx={{ fontSize: 40, color: "#999" }} />
                </Box>
                
                <CardContent className="machine-card-content">
                  <Typography className="machine-name">{m.nome}</Typography>
                  <Typography className="machine-serie">Nº Série: {m.serie}</Typography>
                </CardContent>

                <CardActions className="machine-card-actions">
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => enterMachine(m.id)} // ✅ Redireciona ao clicar
                    endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                    className="enter-btn"
                  >
                    Entrar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}