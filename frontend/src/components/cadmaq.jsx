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
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

// Importação do CSS padronizado
import "./cadmaq.css";

export default function CadMaq() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const enterMachine = (id) => {
    navigate(`/visualizarmaquina/${id}`);
  };

  return (
    <Box className="cadmaq-panel">
      <Box className="cadmaq-header">
        <Typography variant="h5" className="cadmaq-title">
          Máquinas
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />
      <Box className="cadmaq-search-container">

        <div className="search-wrapper">
          <div className="search-input-box">
            <SearchIcon className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Buscar" 
              className="input-busca"
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <ArrowUpwardIcon className="search-upload-icon" />
          </div>
        </div>
      </Box>



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
          <Grid container spacing={22.5}>
            {machines
              .filter((m) =>
                m.nome_maquina.toLowerCase().includes(searchTerm.toLowerCase())
              )
            .map((m) => (
              <Grid item xs={2} sm={2} md={2} lg={2} key={m.id} className="machine-grid-item">
                <Card elevation={0} className="machine-card">
                  <Box className="machine-image-placeholder">
                    {m.imagem ? (
                      <>
                        <img
                          src={`http://localhost:5000/api/machines/files/${m.imagem}`}
                          alt={m.nome_maquina}
                          className="machine-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = e.target.parentNode.querySelector(".machine-image-fallback");
                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                        <Box className="machine-image-fallback" sx={{ display: "none" }}>
                          <ImageOutlinedIcon sx={{ fontSize: 40, color: "#999" }} />
                        </Box>
                      </>
                    ) : (
                      <Box className="machine-image-fallback">
                        <ImageOutlinedIcon sx={{ fontSize: 40, color: "#999" }} />
                      </Box>
                    )}
                  </Box>

                  <CardContent className="machine-card-content">
                    <Typography className="machine-name">
                      {m.nome_maquina}
                    </Typography>
                    <Typography className="machine-serie">
                      Nº Série: {m.num_serie}
                    </Typography>
                  </CardContent>

                  <CardActions className="machine-card-actions">
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => enterMachine(m.id)}
                      
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