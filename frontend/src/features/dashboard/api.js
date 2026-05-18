import api from "@/shared/api/client";

export const sendChatMessage = (email, messages) => api.post("/api/chat", { email, messages });
export const saveMoodToBackend = (email, mood) => api.post("/api/mood", { email, mood });
