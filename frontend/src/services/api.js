import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

export const getQuestions = (mode = "default", diseaseIDs = [], email = "") => {
  let url = `/api/questions?mode=${mode}`;
  if (diseaseIDs.length > 0) {
    url += `&disease_ids=${diseaseIDs.join(",")}`;
  }
  if (email) {
    url += `&email=${encodeURIComponent(email)}`;
  }
  url += url.includes("?") ? `&_t=${Date.now()}` : `?_t=${Date.now()}`;
  return api.get(url);
};

export const diagnose = (answers, userEmail = "", refinedDiseaseID = 0) => api.post("/api/diagnose", { answers, user_email: userEmail, refined_disease_id: refinedDiseaseID });

export const getDiscoveryQuestions = (answers) => api.post("/api/questions/discovery", { answers });

export const getHistory = (email) => api.get(`/api/history?email=${email}`);
export const getProfile = (email) => api.get(`/api/profile?email=${email}`);
export const updateProfile = (email, name, avatarUrl = "") => api.post("/api/profile", { email, name, avatar_url: avatarUrl });
export const deleteAccount = (email) => api.delete(`/api/profile?email=${email}`);
export const sendChatMessage = (email, messages) => api.post("/api/chat", { email, messages });

// Public
export const getPublicFAQ = () => api.get("/api/faq");
export const getPublicBanners = () => api.get("/api/banners");
export const getLevels = () => api.get("/api/levels");

// Admin - Helper for headers
const adminConfig = (email) => ({
  headers: { "X-Admin-Email": email }
});

// Admin - Banners
export const adminGetBanners = (email) => api.get("/api/admin/banners", adminConfig(email));
export const adminUpsertBanner = (email, data) => api.post("/api/admin/banners", data, adminConfig(email));
export const adminDeleteBanner = (email, id) => api.delete(`/api/admin/banners/${id}`, adminConfig(email));

// Admin - FAQ
export const adminGetFAQ = (email) => api.get("/api/admin/faq", adminConfig(email));
export const adminUpsertFAQ = (email, data) => api.post("/api/admin/faq", data, adminConfig(email));
export const adminDeleteFAQ = (email, id) => api.delete(`/api/admin/faq/${id}`, adminConfig(email));

// Admin - News (Articles)
export const adminGetNews = (email) => api.get("/api/admin/news", adminConfig(email));
export const adminUpsertNews = (email, data) => api.post("/api/admin/news", data, adminConfig(email));
export const adminDeleteNews = (email, id) => api.delete(`/api/admin/news/${id}`, adminConfig(email));

// Admin - Knowledge Base
export const adminGetSymptoms = (email) => api.get("/api/admin/symptoms", adminConfig(email));
export const adminUpsertSymptom = (email, data) => api.post("/api/admin/symptoms", data, adminConfig(email));
export const adminDeleteSymptom = (email, id) => api.delete(`/api/admin/symptoms/${id}`, adminConfig(email));

export const adminGetDiseases = (email) => api.get("/api/admin/diseases", adminConfig(email));
export const adminUpsertDisease = (email, data) => api.post("/api/admin/diseases", data, adminConfig(email));
export const adminDeleteDisease = (email, id) => api.delete(`/api/admin/diseases/${id}`, adminConfig(email));

export const adminGetRules = (email) => api.get("/api/admin/rules", adminConfig(email));
export const adminUpsertRule = (email, data) => api.post("/api/admin/rules", data, adminConfig(email));
export const adminDeleteRule = (email, id) => api.delete(`/api/admin/rules/${id}`, adminConfig(email));

// Feedback (Public)
export const getPublicTestimonials = () => api.get("/api/testimonials");
export const submitTestimonial = (data) => api.post("/api/testimonials", data);
export const submitAccountFeedback = (data) => api.post("/api/account_feedbacks", data);

// Feedback (Admin)
export const adminGetTestimonials = (email) => api.get("/api/admin/testimonials", adminConfig(email));
export const adminUpdateTestimonialDisplay = (email, id, isDisplayed) => api.put(`/api/admin/testimonials/${id}/display`, { is_displayed: isDisplayed }, adminConfig(email));
export const adminGetAccountFeedbacks = (email) => api.get("/api/admin/account_feedbacks", adminConfig(email));

export default api;