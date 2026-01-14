from flask import request, jsonify
from services.chat_service import send_prompt

def chat():
    data = request.get_json()
    prompt = data.get("prompt")

    response = send_prompt(prompt)

    return jsonify({"response": response})
