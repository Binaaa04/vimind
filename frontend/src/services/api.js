import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // ganti sesuai port backend Go kalian
});

export default api;