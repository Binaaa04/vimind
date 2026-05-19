import api from "@/shared/api/client";

export const getPublicFAQ = () => api.get("/api/faq");
export const getPublicBanners = () => api.get("/api/banners");
export const getPublicTestimonials = () => api.get("/api/testimonials");
export const submitTestimonial = (data) => api.post("/api/testimonials", data);
export const submitAccountFeedback = (data) => api.post("/api/account_feedbacks", data);
export const checkRating = (email) => api.get(`/api/check-rating?email=${encodeURIComponent(email)}`);
