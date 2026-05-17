import api from "@/shared/api/client";

export const getQuestions = (mode = "default", diseaseIDs = [], email = "") => {
  let url = `/api/questions?mode=${mode}`;
  if (diseaseIDs.length > 0) url += `&disease_ids=${diseaseIDs.join(",")}`;
  if (email) url += `&email=${encodeURIComponent(email)}`;
  url += `&_t=${Date.now()}`;
  return api.get(url);
};
export const diagnose = (answers, userEmail = "", refinedDiseaseID = 0) => api.post("/api/diagnose", { answers, user_email: userEmail, refined_disease_id: refinedDiseaseID });
export const getDiscoveryQuestions = (answers) => api.post("/api/questions/discovery", { answers });
export const getHistory = (email) => api.get(`/api/history?email=${email}`);
export const getLevels = () => api.get("/api/levels");
export const saveTestSession = (email, sessionId, answers, currentPage) => api.post(`/api/test-session?email=${email}&session_id=${sessionId}`, { answers, current_page: currentPage });
export const getTestSession = (email, sessionId) => api.get(`/api/test-session?email=${email}&session_id=${sessionId}`);
export const deleteTestSession = (email, sessionId) => api.delete(`/api/test-session?email=${email}&session_id=${sessionId}`);
