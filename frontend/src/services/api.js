import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

export const getQuestions = () => api.get("/api/questions");
export const diagnose = (answers, userId = null) => api.post("/api/diagnose", { answers, user_id: userId });

export default api;