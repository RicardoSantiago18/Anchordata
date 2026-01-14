
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1a4e48',
    fontFamily: 'Arial, sans-serif',
  },
  loginBox: {
    backgroundColor: '#333a45',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    width: '400px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  subHeader: {
    fontSize: '14px',
    color: '#b0b0b0',
    marginBottom: '30px',
  },
  googleButton: {
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    padding: '12px',
    width: '100%',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginBottom: '30px',
  },
  googleIcon: {
    marginRight: '10px',
    width: '20px',
    height: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#b0b0b0',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #555',
    borderRadius: '5px',
    backgroundColor: '#333a45',
    color: '#fff',
    fontSize: '16px',
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    fontSize: '14px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    color: '#b0b0b0',
  },
  checkbox: {
    marginRight: '8px',
  },
  forgotPassword: {
    color: '#28a745',
    textDecoration: 'none',
  },
  submitButton: {
    background: 'linear-gradient(to right, #28a745, #218838)',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '15px',
    width: '100%',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  signup: {
    fontSize: '14px',
    textAlign: 'center',
    color: '#b0b0b0',
  },
  signupLink: {
    color: '#28a745',
    textDecoration: 'none',
  },
  brandContainer: {
    position: 'absolute',
    top: '40px',
    right: '40px',
    textAlign: 'right',
    color: '#fff',
  },
  brandName: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
  brandSubtitle: {
    fontSize: '16px',
  },
  anchorIcon: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '150px',
      opacity: '0.2',
  }
};


const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault(); 
    
    if (email && password) {
      console.log('Login "mockado" com sucesso com:', { email, password });
      navigate('/maquinas');
    } else {
      alert('Por favor, preencha o e-mail e a senha.');
    }
  };


  return (
    // Envolvemos o conteúdo em um <form> para usar o onSubmit
    <form style={styles.container} onSubmit={handleLogin}>
      <div style={styles.brandContainer}>
        <div style={styles.brandName}>AnchorData</div>
        <div style={styles.brandSubtitle}>Seu assistente de manutenção pessoal</div>
      </div>
      
      

      <div style={styles.loginBox}>
        <div style={styles.header}>Login</div>
        <div style={styles.subHeader}>E-mail e senha para entrar</div>

        

        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          {/* Conectamos o input ao estado 'email' */}
          <input 
            type="email" 
            id="email" 
            style={styles.input} 
            value={email} 
            onChange={(e ) => setEmail(e.target.value)} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Senha</label>
          {/* Conectamos o input ao estado 'password' */}
          <input 
            type="password" 
            id="password" 
            style={styles.input} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <div style={styles.options}>
          <div style={styles.rememberMe}>
            <input type="checkbox" id="remember" style={styles.checkbox} />
            <label htmlFor="remember">Lembrar de mim?</label>
          </div>
          <a href="#" style={styles.forgotPassword}>Esqueceu sua senha?</a>
        </div>

        {/* O botão agora é do tipo "submit" para acionar o onSubmit do formulário */}
        <button type="submit" style={styles.submitButton}>Entrar</button>

        <div style={styles.signup}>
          Não registrado? <a href="#" style={styles.signupLink}>Criar uma conta</a>
        </div>
      </div>
    </form>
  );
};

export default Login;
