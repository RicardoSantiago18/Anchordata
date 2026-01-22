const API_URL = import.meta.env.VITE_API_URL;

export async function sendChatMessage(message) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao se comunicar com o backend");
  }

  const data = await response.json();
  return data;
}
