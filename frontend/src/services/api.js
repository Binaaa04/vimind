import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

export const getQuestions = (mode = "default", diseaseIDs = []) => {
  let url = `/api/questions?mode=${mode}`;
  if (diseaseIDs.length > 0) {
    url += `&disease_ids=${diseaseIDs.join(",")}`;
  }
  return api.get(url);
};
export const diagnose = (answers, userEmail = "") => api.post("/api/diagnose", { answers, user_email: userEmail });
export const getHistory = (email) => api.get(`/api/history?email=${email}`);
export const getProfile = (email) => api.get(`/api/profile?email=${email}`);
export const updateProfile = (email, name, avatarUrl = "") => api.post("/api/profile", { email, name, avatar_url: avatarUrl });

export default api;