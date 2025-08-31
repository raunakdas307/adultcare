import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/", // Django backend
});

// Attach access token to every request
API.interceptors.request.use((req) => {
  const access = localStorage.getItem("access");
  if (access) {
    req.headers.Authorization = `Bearer ${access}`;
  }
  return req;
});

// Handle expired tokens automatically
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If unauthorized & not retried yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token available.");

        // Request new access token
        const { data } = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh }
        );

        const newAccess = data?.access;
        if (newAccess) {
          localStorage.setItem("access", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return API(originalRequest); // Retry failed request
        }
      } catch (refreshError) {
        console.error("🔴 Token refresh failed:", refreshError);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login"; // Redirect to login
      }
    }

    return Promise.reject(err);
  }
);

export default API;
