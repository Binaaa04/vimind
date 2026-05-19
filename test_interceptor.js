const test = `
import axios from "axios";
import { supabase } from "@/services/supabaseClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

// Cache the token to avoid calling getSession() on every request, which uses locks and is slow!
let currentToken = null;

// Keep the token updated whenever auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  currentToken = session?.access_token || null;
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    // If token is missing (e.g., initial load), fetch it once
    if (!currentToken) {
      const { data: { session } } = await supabase.auth.getSession();
      currentToken = session?.access_token || null;
    }
    
    if (currentToken) {
      config.headers.Authorization = \`Bearer \${currentToken}\`;
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
`;
