import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send/receive http-only auth cookies
});

let isRefreshing = false;
let queue = [];

function processQueue(error) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
}

// Transparently refresh the access token once on a 401, then retry the request.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(original));
      }

      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
