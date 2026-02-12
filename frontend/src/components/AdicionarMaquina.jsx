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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    nome_maquina: '',
    num_serie: '',
    marca: '',
    setor: '',
    data_fabricacao: '',
    fabricante: '',
    contato_fabricante: '',
    description: ''
  });

  const [imagem, setImagem] = useState(null);
  const [manual, setManual] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'imagem') {
        setImagem(file);
        setPreviewImagem(URL.createObjectURL(file));
      } else if (type === 'manual') {
        setManual(file);
      }
    }
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      // Validate Step 1
      const required = ['nome_maquina', 'num_serie', 'marca', 'setor', 'data_fabricacao', 'fabricante', 'contato_fabricante', 'description'];
      const missing = required.filter(field => !formData[field]);
      if (missing.length > 0) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      setStep(prev => prev + 1);
    } else if (step === 2) {
      // Submit Data
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (imagem) data.append('imagem', imagem);
      if (manual) data.append('manual', manual);

      const response = await fetch(`${API_URL}/machines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao cadastrar máquina');
      }

      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {/* step 01 */}
        {step === 1 && (
          <>
            <Typography variant="h6" className="form-section-title">Dados Gerais</Typography>
            <div className="form-grid">
              <div className="form-column">
                <div className="upload-box" onClick={() => document.getElementById('imagem-upload').click()} style={{ cursor: 'pointer', backgroundImage: previewImagem ? `url(${previewImagem})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!previewImagem && (
                    <>
                      <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#666' }} />
                      <Typography variant="body2">Clique para adicionar imagem</Typography>
                    </>
                  )}
                  <input
                    type="file"
                    id="imagem-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'imagem')}
                  />
                  {!previewImagem && <button className="btn-browse" type="button">Procurar neste Dispositivo</button>}
                </div>
                <div className="input-group">
                  <label>Nome da Máquina</label>
                  <input type="text" name="nome_maquina" value={formData.nome_maquina} onChange={handleInputChange} placeholder="Inserir nome" />
                </div>
                <div className="input-group">
                  <label>Número de Série</label>
                  <input type="text" name="num_serie" value={formData.num_serie} onChange={handleInputChange} placeholder="Inserir número de série" />
                </div>
              </div>
              <div className="form-column">
                <div className="row-inputs">
                  <div className="input-group"><label>Setor de Funcionamento</label><input type="text" name="setor" value={formData.setor} onChange={handleInputChange} placeholder="Inserir Setor" /></div>
                  <div className="input-group"><label>Data de Fabricação</label><input type="date" name="data_fabricacao" value={formData.data_fabricacao} onChange={handleInputChange} /></div>
                </div>
                <div className="row-inputs">
                  <div className="input-group"><label>Marca</label><input type="text" name="marca" value={formData.marca} onChange={handleInputChange} placeholder="Inserir marca" /></div>
                  <div className="input-group"><label>Fabricante</label><input type="text" name="fabricante" value={formData.fabricante} onChange={handleInputChange} placeholder="Inserir nome" /></div>
                </div>
                <div className="input-group">
                  <label>Contato do Fabricante</label>
                  <input type="text" name="contato_fabricante" value={formData.contato_fabricante} onChange={handleInputChange} placeholder="+55 (00) 90000-0000" />
                </div>
                <div className="input-group">
                  <label>Descrição da Máquina</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Lorem Ipsum..." rows={5} />
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
              <div className="upload-box-large" onClick={() => document.getElementById('manual-upload').click()} style={{ cursor: 'pointer' }}>
                <AddPhotoAlternateIcon sx={{ fontSize: 50, color: '#666' }} />
                <Typography variant="body1">{manual ? manual.name : "Arraste arquivo aqui ou clique"}</Typography>
                <input
                  type="file"
                  id="manual-upload"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'manual')}
                />
                <button className="btn-browse" type="button">Procurar neste Dispositivo</button>
              </div>
            </div>
            <div className="form-actions centered-actions">
              <button className="btn-cancel" onClick={handleBack} disabled={loading}>Cancelar</button>
              <button className="btn-next" onClick={handleNext} disabled={loading}>{loading ? 'Salvando...' : 'Concluir'}</button>
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