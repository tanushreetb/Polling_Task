import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically inject JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pulsevote_token');
    if (token && token !== 'demo-jwt-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const pollAPI = {
  list: () => api.get('/polls'),
  getById: (id) => api.get(`/polls/${id}`),
  getResults: (id) => api.get(`/polls/${id}/results`),
  create: (data) => api.post('/polls', data),
  castVote: (id, data) => api.post(`/polls/${id}/vote`, data),
  getUserPolls: () => api.get('/user/polls'),
};

export default api;
