import api, { adminConfig } from "@/shared/api/client";

export const adminGetBanners = (email) => api.get("/api/admin/banners", adminConfig(email));
export const adminUpsertBanner = (email, data) => api.post("/api/admin/banners", data, adminConfig(email));
export const adminDeleteBanner = (email, id) => api.delete(`/api/admin/banners/${id}`, adminConfig(email));
export const adminGetFAQ = (email) => api.get("/api/admin/faq", adminConfig(email));
export const adminUpsertFAQ = (email, data) => api.post("/api/admin/faq", data, adminConfig(email));
export const adminDeleteFAQ = (email, id) => api.delete(`/api/admin/faq/${id}`, adminConfig(email));
export const adminGetNews = (email) => api.get("/api/admin/news", adminConfig(email));
export const adminUpsertNews = (email, data) => api.post("/api/admin/news", data, adminConfig(email));
export const adminDeleteNews = (email, id) => api.delete(`/api/admin/news/${id}`, adminConfig(email));
export const adminGetSymptoms = (email) => api.get("/api/admin/symptoms", adminConfig(email));
export const adminUpsertSymptom = (email, data) => api.post("/api/admin/symptoms", data, adminConfig(email));
export const adminDeleteSymptom = (email, id) => api.delete(`/api/admin/symptoms/${id}`, adminConfig(email));
export const adminGetDiseases = (email) => api.get("/api/admin/diseases", adminConfig(email));
export const adminUpsertDisease = (email, data) => api.post("/api/admin/diseases", data, adminConfig(email));
export const adminDeleteDisease = (email, id) => api.delete(`/api/admin/diseases/${id}`, adminConfig(email));
export const adminGetRules = (email) => api.get("/api/admin/rules", adminConfig(email));
export const adminUpsertRule = (email, data) => api.post("/api/admin/rules", data, adminConfig(email));
export const adminDeleteRule = (email, id) => api.delete(`/api/admin/rules/${id}`, adminConfig(email));
export const adminGetTestimonials = (email) => api.get("/api/admin/testimonials", adminConfig(email));
export const adminUpdateTestimonialDisplay = (email, id, isDisplayed) => api.put(`/api/admin/testimonials/${id}/display`, { is_displayed: isDisplayed }, adminConfig(email));
export const adminGetAccountFeedbacks = (email) => api.get("/api/admin/account_feedbacks", adminConfig(email));

export const adminGetUsers = (email) => api.get("/api/admin/users", adminConfig(email));
