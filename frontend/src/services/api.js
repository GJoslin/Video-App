import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const auth = {
  login: async (username, password) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
  
  register: async (username, displayName, password) => {
    const response = await api.post('/register', { username, displayName, password });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Video API calls
export const videos = {
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/videos?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  upload: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  like: async (videoId) => {
    const response = await api.post(`/videos/${videoId}/like`);
    return response.data;
  },
  
  bookmark: async (videoId) => {
    const response = await api.post(`/videos/${videoId}/bookmark`);
    return response.data;
  },
  
  share: async (videoId) => {
    const response = await api.post(`/videos/${videoId}/share`);
    return response.data;
  },
  
  getComments: async (videoId, page = 1, limit = 20) => {
    const response = await api.get(`/videos/${videoId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  addComment: async (videoId, text) => {
    const response = await api.post(`/videos/${videoId}/comment`, { text });
    return response.data;
  }
};

// User API calls
export const users = {
  follow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
  
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  getUserVideos: async (userId, page = 1, limit = 12) => {
    const response = await api.get(`/users/${userId}/videos?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Utility functions
export const utils = {
  getAuthToken: () => localStorage.getItem('token'),
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default api;