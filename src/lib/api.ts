import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (userData: any) => api.post('/users', userData),
  update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string, newPassword: string) => api.post(`/users/${id}/reset-password`, { newPassword }),
};

// Videos API
export const videosAPI = {
  getAll: () => api.get('/videos'),
  create: (videoData: any) => api.post('/videos', videoData),
  update: (id: string, videoData: any) => api.put(`/videos/${id}`, videoData),
  delete: (id: string) => api.delete(`/videos/${id}`),
};

// Assignments API
export const assignmentsAPI = {
  getAll: () => api.get('/assignments'),
  create: (assignmentData: any) => api.post('/assignments', assignmentData),
  update: (id: string, assignmentData: any) => api.put(`/assignments/${id}`, assignmentData),
  delete: (id: string) => api.delete(`/assignments/${id}`),
};

// Results API
export const resultsAPI = {
  getAll: () => api.get('/results'),
  create: (resultData: any) => api.post('/results', resultData),
  update: (id: string, resultData: any) => api.put(`/results/${id}`, resultData),
  delete: (id: string) => api.delete(`/results/${id}`),
};

// Announcements API
export const announcementsAPI = {
  getAll: () => api.get('/announcements'),
  create: (announcementData: any) => api.post('/announcements', announcementData),
  update: (id: string, announcementData: any) => api.put(`/announcements/${id}`, announcementData),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivities: () => api.get('/dashboard/activities'),
};

// Assignment Submissions API
export const submissionsAPI = {
  getAll: () => api.get('/submissions'),
  create: (submissionData: any) => api.post('/submissions', submissionData),
  update: (id: string, submissionData: any) => api.put(`/submissions/${id}`, submissionData),
  delete: (id: string) => api.delete(`/submissions/${id}`),
  getByAssignment: (assignmentId: string) => api.get(`/submissions/assignment/${assignmentId}`),
};

// Activities API
export const activitiesAPI = {
  getAll: () => api.get('/activities'),
  create: (activityData: any) => api.post('/activities', activityData),
};

export default api;