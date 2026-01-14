from flask import request, jsonify

def login():
    data = request.get_json()
    return jsonify({"message": "Login recebido", "data": data})