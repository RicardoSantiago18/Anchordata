import sqlite3
from pathlib import Path
DB = Path(__file__).resolve().parents[1] / 'database' / 'app.db'
conn = sqlite3.connect(str(DB))
cur = conn.cursor()
print('DB:', DB)
for row in cur.execute("SELECT id, nome_maquina, num_serie, manual FROM machines ORDER BY id"):
    print(row)
conn.close()
