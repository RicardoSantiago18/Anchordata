from flask import jsonify
from src.services.home_service import HomeService

def home(current_user):
    data = HomeService.get_home_data(current_user.id)
    return jsonify(data), 200