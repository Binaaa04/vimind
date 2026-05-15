import api from "@/shared/api/client";

export const getProfile = (email) => api.get(`/api/profile?email=${email}`);
export const updateProfile = (email, name, avatarUrl = "") => api.post("/api/profile", { email, name, avatar_url: avatarUrl });
export const deleteAccount = (email) => api.delete(`/api/profile?email=${email}`);
export const submitAccountFeedback = (data) => api.post("/api/account_feedbacks", data);
