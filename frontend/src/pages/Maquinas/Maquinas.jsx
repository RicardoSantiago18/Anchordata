import React from 'react';

// Estilos para a página de Máquinas
const styles = {
  header: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
  },
  searchBar: {
    width: '100%',
    maxWidth: '400px',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#3f4652',
    color: '#fff',
    marginBottom: '40px',
  },
  machinesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '30px',
  },
  machineCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    color: '#333',
  },
  machineImage: {
    width: '100%',
    height: '150px',
    objectFit: 'contain',
    marginBottom: '15px',
  },
  machineName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  addCard: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px dashed #555',
    borderRadius: '10px',
    cursor: 'pointer',
    minHeight: '220px', // Altura similar ao card da máquina
    color: '#555',
  },
  addIcon: {
    fontSize: '50px',
    fontWeight: 'bold',
  },
};

const Maquinas = () => {
  return (
    <div>
      <h1 style={styles.header}>Máquinas Registradas</h1>
      <input 
        type="text" 
        placeholder="Pesquisar em Máquinas Registradas..." 
        style={styles.searchBar} 
      />
      <div style={styles.machinesGrid}>
        {/* Card de Máquina Existente */}
        <div style={styles.machineCard}>
          <img 
            src="https://i.imgur.com/your-printer-image.png" 
            alt="Impressora 3D Sethi S4X" 
            style={styles.machineImage} 
          />
          <div style={styles.machineName}>Impressora 3D Sethi S4X</div>
        </div>

        {/* Card para Adicionar Nova Máquina */}
        <div style={styles.addCard}>
          <div style={styles.addIcon}>+</div>
        </div>
      </div>
    </div>
   );
};

export default Maquinas;
