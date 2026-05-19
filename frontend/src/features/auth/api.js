import api from "@/shared/api/client";

export const getProfile = (email = "") => {
  const url = email ? `/api/profile?email=${email}` : "/api/profile";
  return api.get(url);
};

export const updateProfile = (email, name, avatarUrl = "", birthDate = "") => {
  // email can be empty if authenticated, backend will use JWT
  return api.post("/api/profile", { email, name, avatar_url: avatarUrl, birth_date: birthDate });
};

export const deleteAccount = (email = "") => {
  const url = email ? `/api/profile?email=${email}` : "/api/profile";
  return api.delete(url);
};

export const submitAccountFeedback = (data) => api.post("/api/account_feedbacks", data);
