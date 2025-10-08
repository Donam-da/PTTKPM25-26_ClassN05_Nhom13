import api from './api';

export const RegistrationService = {
  list: () => api.get('/registrations').then(r => r.data),
  register: (payload) => api.post('/registrations', payload).then(r => r.data),
  approve: (id) => api.put(`/registrations/${id}/approve`).then(r => r.data),
  drop: (id) => api.put(`/registrations/${id}/drop`).then(r => r.data),
};
