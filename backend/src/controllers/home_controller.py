from flask import jsonify

def home():
    return jsonify({"status": "Backend Flask rodando"})