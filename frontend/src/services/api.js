import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

export const getQuestions = () => api.get("/api/questions");
export const diagnose = (answers, userEmail = "") => api.post("/api/diagnose", { answers, user_email: userEmail });
export const getHistory = (email) => api.get(`/api/history?email=${email}`);

export default api;