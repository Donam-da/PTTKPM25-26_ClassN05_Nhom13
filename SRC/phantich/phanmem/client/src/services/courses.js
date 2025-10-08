import api from './api';

export const CourseService = {
  list: () => api.get('/courses').then(r => r.data),
  detail: (id) => api.get(`/courses/${id}`).then(r => r.data),
  create: (payload) => api.post('/courses', payload).then(r => r.data),
  update: (id, payload) => api.put(`/courses/${id}`, payload).then(r => r.data),
};
