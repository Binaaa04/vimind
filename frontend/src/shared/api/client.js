import axios from "axios";
import { supabase } from "@/services/supabaseClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Deprecated: Use JWT token instead of raw email headers
const adminConfig = () => ({});

export { adminConfig };
export default api;
