import api from "@/shared/api/client";

// Admin API calls now rely on JWT token for authentication and authorization.
// The email parameter is kept as optional for legacy compatibility but is no longer required.

export const adminGetBanners = () => api.get("/api/admin/banners");
export const adminUpsertBanner = (data) => api.post("/api/admin/banners", data);
export const adminDeleteBanner = (id) => api.delete(`/api/admin/banners/${id}`);

export const adminGetFAQ = () => api.get("/api/admin/faq");
export const adminUpsertFAQ = (data) => api.post("/api/admin/faq", data);
export const adminDeleteFAQ = (id) => api.delete(`/api/admin/faq/${id}`);

export const adminGetNews = () => api.get("/api/admin/news");
export const adminUpsertNews = (data) => api.post("/api/admin/news", data);
export const adminDeleteNews = (id) => api.delete(`/api/admin/news/${id}`);

export const adminGetSymptoms = () => api.get("/api/admin/symptoms");
export const adminUpsertSymptom = (data) => api.post("/api/admin/symptoms", data);
export const adminDeleteSymptom = (id) => api.delete(`/api/admin/symptoms/${id}`);

export const adminGetDiseases = () => api.get("/api/admin/diseases");
export const adminUpsertDisease = (data) => api.post("/api/admin/diseases", data);
export const adminDeleteDisease = (id) => api.delete(`/api/admin/diseases/${id}`);

export const adminGetRules = () => api.get("/api/admin/rules");
export const adminUpsertRule = (data) => api.post("/api/admin/rules", data);
export const adminDeleteRule = (id) => api.delete(`/api/admin/rules/${id}`);

export const adminGetTestimonials = () => api.get("/api/admin/testimonials");
export const adminUpdateTestimonialDisplay = (id, isDisplayed) => api.put(`/api/admin/testimonials/${id}/display`, { is_displayed: isDisplayed });
export const adminGetAccountFeedbacks = () => api.get("/api/admin/account_feedbacks");

export const adminGetUsers = () => api.get("/api/admin/users");
