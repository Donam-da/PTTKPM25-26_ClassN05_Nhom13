import api from './api';

export const AuthService = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  changePassword: (data) => api.post('/auth/change-password', data).then(r => r.data),
};
