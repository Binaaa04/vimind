import axios from "axios";
import { supabase } from "@/services/supabaseClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
});

let currentToken = null;

// Keep the token updated whenever auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  currentToken = session?.access_token || null;
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    if (!currentToken) {
      // Fallback: fetch session if not yet cached
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        currentToken = session.access_token;
      }
    }
    
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
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
