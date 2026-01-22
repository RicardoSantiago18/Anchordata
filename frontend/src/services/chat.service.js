const API_URL = import.meta.env.VITE_API_URL;

export async function createChat(title = "New Chat") {
  const response = await fetch(`${API_URL}/chats/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // para debug
    console.error("Erro ao criar chat:", errorText);
    throw new Error("Erro ao criar chat");
  }

  return response.json();
}

export async function sendChatMessage(chatId, message) {
  const response = await fetch(`${API_URL}/chats/${chatId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ content: message }),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar mensagem");
  }

  return response.json();
}
