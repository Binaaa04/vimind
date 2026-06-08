import api from "@/shared/api/client";

export const sendChatMessage = (email, messages) => api.post("/api/chat", { email, messages });

export const getBanners = () => api.get("/api/banners");

