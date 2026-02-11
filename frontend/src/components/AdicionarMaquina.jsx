import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Divider, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './AdicionarMaquina.css';

const AdicionarMaquina = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  return (
    <Box className="add-machine-panel">
      <Typography variant="h5" className="page-main-title">
        Adicionar Máquina
      </Typography>
      
      <Divider className="title-divider" />

      {/* Stepper Superior */}
      <Box className="stepper-container">
        <div className={`step ${step >= 1 ? 'completed' : ''}`}>
          <CheckCircleIcon className="step-icon" />
          <span>01 Dados Gerais</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 2 ? 'completed' : 'disabled'}`}>
          {step > 2 ? <CheckCircleIcon className="step-icon" /> : <div className="step-circle">02</div>}
          <span>02 Manual da Marca</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step === 3 ? 'completed' : 'disabled'}`}>
          {step === 3 ? <CheckCircleIcon className="step-icon" /> : <div className="step-circle">03</div>}
          <span>03 Concluído</span>
        </div>
      </Box>

      {/* Container Cinza Interno */}
      <Box className="form-gray-container">
        
        {/* step 01 */}
        {step === 1 && (
          <>
            <Typography variant="h6" className="form-section-title">Dados Gerais</Typography>
            <div className="form-grid">
              <div className="form-column">
                <div className="upload-box">
                  <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#666' }} />
                  <Typography variant="body2">Arraste imagem aqui</Typography>
                  <button className="btn-browse">Procurar neste Dispositivo</button>
                </div>
                <div className="input-group">
                  <label>Nome da Máquina</label>
                  <input type="text" placeholder="Inserir nome" />
                </div>
                <div className="input-group">
                  <label>Número de Série</label>
                  <input type="text" placeholder="Inserir número de série" />
                </div>
              </div>
              <div className="form-column">
                <div className="row-inputs">
                  <div className="input-group"><label>Setor de Funcionamento</label><input type="text" placeholder="Inserir Setor" /></div>
                  <div className="input-group"><label>Data de Fabricação</label><input type="text" placeholder="DD/MM/AA" /></div>
                </div>
                <div className="row-inputs">
                  <div className="input-group"><label>Fabricante</label><input type="text" placeholder="Inserir nome" /></div>
                  <div className="input-group"><label>Contato do Fabricante</label><input type="text" placeholder="+55 (00) 90000-0000" /></div>
                </div>
                <div className="input-group">
                  <label>Descrição da Máquina</label>
                  <textarea placeholder="Lorem Ipsum is simply dummy text..." rows={5} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => navigate('/maquinas')}>Cancelar</button>
              <button className="btn-next" onClick={handleNext}>Próximo</button>
            </div>
          </>
        )}

        {/* step 02 */}
        {step === 2 && (
          <div className="step-content-wrapper">
            <IconButton onClick={handleBack} className="back-button-step">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" className="form-section-title">Manual da Marca</Typography>
            
            <div className="manual-upload-wrapper">
              <div className="upload-box-large">
                <AddPhotoAlternateIcon sx={{ fontSize: 50, color: '#666' }} />
                <Typography variant="body1">Arraste arquivo aqui</Typography>
                <button className="btn-browse">Procurar neste Dispositivo</button>
              </div>
            </div>
            <div className="form-actions centered-actions">
              <button className="btn-cancel" onClick={handleBack}>Cancelar</button>
              <button className="btn-next" onClick={handleNext}>Próximo</button>
            </div>
          </div>
        )}

        {/* step 03 */}
        {step === 3 && (
          <div className="step-success-wrapper">
            <Typography variant="h6" className="form-section-title">Concluído</Typography>
            
            <div className="success-content">
              <CheckCircleIcon sx={{ fontSize: 100, color: '#666', mb: 2 }} />
              <Typography variant="h5" className="success-msg">
                Máquina Adicionada com Sucesso!
              </Typography>
            </div>

            <div className="form-actions centered-actions">
              <button className="btn-next" onClick={() => navigate('/maquinas')}>
                Voltar para Início
              </button>
            </div>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default AdicionarMaquina;