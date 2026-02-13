import sqlite3
from datetime import datetime

DB = 'database/app.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

now = datetime.utcnow().isoformat()

machine = {
    'nome_maquina': 'MAQUINA_MOCK_TEST',
    'num_serie': 'MOCK-12345',
    'data_fabricacao': '2020-01-01',
    'marca': 'MarcaMock',
    'fabricante': 'FabricanteMock',
    'setor': 'Oficina',
    'contato_fabricante': 'contato@mock.com',
    'description': 'Máquina mock para testes automatizados',
    'status': 'Regime Saudável',
    'imagem': None,
    'manual': None,
    'created_at': now,
    'updated_at': now,
}

# Insert specifying columns present in model
columns = ','.join([k for k in machine.keys()])
placeholders = ','.join(['?'] * len(machine))
values = list(machine.values())

sql = f"INSERT INTO machines ({columns}) VALUES ({placeholders})"
cur.execute(sql, values)
conn.commit()
last_id = cur.lastrowid
print('INSERTED_MACHINE_ID:', last_id)

# Print inserted row
cur.execute('SELECT id, nome_maquina, num_serie, data_fabricacao, marca, fabricante, setor, contato_fabricante, description FROM machines WHERE id = ?', (last_id,))
row = cur.fetchone()
print('ROW:', row)

conn.close()
