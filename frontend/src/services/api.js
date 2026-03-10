import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

export const getQuestions = () => api.get("/api/questions");
export const diagnose = (answers) => api.post("/api/diagnose", { answers });

export default api;