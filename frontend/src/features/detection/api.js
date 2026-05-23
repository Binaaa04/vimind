import api from "@/shared/api/client";

export const getQuestions = (mode = "default", diseaseIDs = [], email = "") => {
  let url = `/api/questions?mode=${mode}`;
  if (diseaseIDs.length > 0) url += `&disease_ids=${diseaseIDs.join(",")}`;
  if (email) url += `&email=${encodeURIComponent(email)}`;
  url += `&_t=${Date.now()}`;
  return api.get(url);
};

export const diagnose = (answers, userEmail = "", refinedDiseaseID = 0, config = {}) => {
  // userEmail can be empty if authenticated
  return api.post("/api/diagnose", { answers, user_email: userEmail, refined_disease_id: refinedDiseaseID }, config);
};

export const getDiscoveryQuestions = (answers) => api.post("/api/questions/discovery", { answers });

export const getHistory = (email = "") => {
  const url = email ? `/api/history?email=${email}` : "/api/history";
  return api.get(url);
};

export const getLevels = () => api.get("/api/levels");

export const saveTestSession = (email = "", sessionId = "", answers, currentPage, isRefined = false) => {
  let url = "/api/test-session";
  const params = [];
  if (email) params.push(`email=${email}`);
  if (sessionId) params.push(`session_id=${sessionId}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  
  return api.post(url, { answers, current_page: currentPage, is_refined: isRefined });
};

export const getTestSession = (email = "", sessionId = "") => {
  let url = "/api/test-session";
  const params = [];
  if (email) params.push(`email=${email}`);
  if (sessionId) params.push(`session_id=${sessionId}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  
  return api.get(url);
};

export const deleteTestSession = (email = "", sessionId = "") => {
  let url = "/api/test-session";
  const params = [];
  if (email) params.push(`email=${email}`);
  if (sessionId) params.push(`session_id=${sessionId}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  
  return api.delete(url);
};
