from services.chat_service import ChatService
from services.maquina_service import MaquinaService
# from services.notification_service import NotificationService

class HomeService:

    @staticmethod
    def get_home_data(user_id: int):
        return {
            "machines": MaquinaService.get_home_machines(),
            "timeline": HomeService._get_timeline(user_id),
            "chats": ChatService.list_achats(user_id),
            "notifications": []
        }
    
    @staticmethod
    def _get_timeline(user_id: int):
        """
        Linha do tempo é um agregador de eventos:
        - Registro de falhas
        - Registro de manutenção
        - Registro de alertas
        - Registro de recomnedações
        """

        return[]