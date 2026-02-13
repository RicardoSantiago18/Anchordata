import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress
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
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch machines from the backend
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/machines");
        if (!response.ok) {
          throw new Error("Erro ao carregar máquinas");
        }
        const data = await response.json();
        setMachines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

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
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : machines.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="textSecondary">Nenhuma máquina cadastrada</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {machines.map((m) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={m.id}>
                <Card elevation={0} className="machine-card">

                  {/* Imagem da Máquina ou Placeholder */}
                  <Box className="machine-image-placeholder">
                    {m.imagem ? (
                      <img
                        src={`http://localhost:5000/api/machines/files/${m.imagem}`}
                        alt={m.nome_maquina}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '14px'
                        }}
                        onError={(e) => {
                          // Se a imagem falhar ao carregar, mostra o ícone placeholder
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <ImageOutlinedIcon
                      sx={{
                        fontSize: 40,
                        color: "#999",
                        display: m.imagem ? 'none' : 'block'
                      }}
                    />
                  </Box>

                  <CardContent className="machine-card-content">
                    <Typography className="machine-name">{m.nome_maquina}</Typography>
                    <Typography className="machine-serie">Nº Série: {m.num_serie}</Typography>
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
        )}
      </Box>
    </Box>
  );
}