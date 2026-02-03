import { AuthService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function createChat(title = "New Chat") {
  const token = AuthService.getToken();

  const response = await fetch(`${API_URL}/chats/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ title }),
  });

  if (response.status === 401) {
    AuthService.logout();
    window.location.href = '/login';
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao criar chat:", errorText);
    throw new Error("Erro ao criar chat");
  }

  return response.json();
}

export async function sendChatMessage(chatId, message) {
  const token = AuthService.getToken();

  const response = await fetch(`${API_URL}/chats/${chatId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ content: message }),
  });

  if (response.status === 401) {
    AuthService.logout();
    window.location.href = '/login';
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    throw new Error("Erro ao enviar mensagem");
  }

  return response.json();
}
