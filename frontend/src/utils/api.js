import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tasks API
export const tasksAPI = {
  getAll: (params) => axios.get('/tasks', { params }),
  create: (data) => axios.post('/tasks', data),
  update: (id, data) => axios.put(`/tasks/${id}`, data),
  delete: (id) => axios.delete(`/tasks/${id}`),
  getStats: () => axios.get('/tasks/stats')
};

// Goals API
export const goalsAPI = {
  getAll: () => axios.get('/goals'),
  create: (data) => axios.post('/goals', data),
  update: (id, data) => axios.put(`/goals/${id}`, data),
  delete: (id) => axios.delete(`/goals/${id}`)
};

// Diary API
export const diaryAPI = {
  getAll: (params) => axios.get('/diary', { params }),
  create: (data) => axios.post('/diary', data),
  update: (id, data) => axios.put(`/diary/${id}`, data),
  delete: (id) => axios.delete(`/diary/${id}`)
};

// Users API
export const usersAPI = {
  updateProfile: (data) => axios.put('/users/profile', data),
  updatePreferences: (data) => axios.put('/users/preferences', data),
  deleteAccount: () => axios.delete('/users/account')
};

// Notes API
export const notesAPI = {
  getAll: () => axios.get('/notes'),
  create: (data) => axios.post('/notes', data),
  update: (id, data) => axios.put(`/notes/${id}`, data),
  delete: (id) => axios.delete(`/notes/${id}`)
};

// Alarms API
export const alarmsAPI = {
  getAll: () => axios.get('/alarms'),
  create: (data) => axios.post('/alarms', data),
  update: (id, data) => axios.put(`/alarms/${id}`, data),
  delete: (id) => axios.delete(`/alarms/${id}`)
};