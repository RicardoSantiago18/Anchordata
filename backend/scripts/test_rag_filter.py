# script to verify rag_chain filtering
import sys, os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from src.rag_chain import create_chain

rag_chain, _, _ = create_chain('rag_test.txt')

for mid in [2,3]:
    res = rag_chain.invoke({'question': 'rolamento', 'history': [], 'machine_id': mid})
    print('--- machine_id', mid, 'result snippet ---')
    print(res[:500])
