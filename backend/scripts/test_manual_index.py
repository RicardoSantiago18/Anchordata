"""Teste de inserção automática de manual no vectorstore via MaquinaService"""

import sys, os

# ensure project root is in Python path so `import src` works in ad-hoc scripts
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from src.services.maquina_service import MaquinaService
from src.app import create_app
from datetime import datetime
import io

# inicializa contexto flask para usar db
app = create_app()
app.app_context().push()

# define caminho para um pdf existente (machine 2 manual já presente)
pdf_path = 'data/machines/2/manual_torno.pdf'

# cria um FileStorage-like object
from werkzeug.datastructures import FileStorage
manual_file = FileStorage(open(pdf_path, 'rb'), filename='manual_torno.pdf', content_type='application/pdf')

machine = MaquinaService.create_machine(
    nome_maquina='Teste Index',
    num_serie='XYZ123',
    data_fabricacao=datetime.now(),
    marca='MarcaX',
    fabricante='FabX',
    setor='Setor1',
    contato_fabricante='contato@fabx.com',
    description='Descrição de teste',
    imagem_file=None,
    manual_file=manual_file
)

print('Criada máquina', machine)

# Depois de criada, o vectorstore já deve conter documentos com machine_id igual
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
emb = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = FAISS.load_local('data/vectorstore', emb, allow_dangerous_deserialization=True)
docs = db.similarity_search_with_score('rolamento', k=5)
print('Documents retrieved (rolamento query):')
for d, score in docs:
    print(d.metadata)
    print(d.page_content[:200])
