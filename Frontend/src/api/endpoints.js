import api from './client'

const data = (promise) => promise.then((r) => r.data)

export const AuthApi = {
  login: (body) => data(api.post('/auth/login', body)),
  changePassword: (body) => data(api.post('/auth/change-password', body)),
  forgot: (email) => data(api.post('/auth/forgot-password', { email })),
  reset: (body) => data(api.post('/auth/reset-password', body)),
}

export const ClassApi = {
  list: () => data(api.get('/api/classes')),
  create: (body) => data(api.post('/api/classes', body)),
  remove: (id) => data(api.delete(`/api/classes/${id}`)),
}

export const StudentApi = {
  search: (params) => data(api.get('/api/students', { params })),
  get: (id) => data(api.get(`/api/students/${id}`)),
  overview: (id) => data(api.get(`/api/students/${id}/overview`)),
  create: (body) => data(api.post('/api/students', body)),
  update: (id, body) => data(api.put(`/api/students/${id}`, body)),
  remove: (id) => data(api.delete(`/api/students/${id}`)),
  resend: (id) => data(api.post(`/api/students/${id}/resend-credentials`)),
  exportCsv: (params) => api.get('/api/students/export', { params, responseType: 'blob' }).then((r) => r.data),
}

export const TeacherApi = {
  list: () => data(api.get('/api/teachers')),
  create: (body) => data(api.post('/api/teachers', body)),
  update: (id, body) => data(api.put(`/api/teachers/${id}`, body)),
  remove: (id) => data(api.delete(`/api/teachers/${id}`)),
  resend: (id) => data(api.post(`/api/teachers/${id}/resend-credentials`)),
}

export const AttendanceApi = {
  roster: (classId, date) => data(api.get(`/api/attendance/class/${classId}`, { params: { date } })),
  save: (classId, body) => data(api.post(`/api/attendance/class/${classId}`, body)),
}

export const ExamApi = {
  list: (classId) => data(api.get('/api/exams', { params: classId ? { classId } : {} })),
  create: (body) => data(api.post('/api/exams', body)),
  update: (id, body) => data(api.put(`/api/exams/${id}`, body)),
  remove: (id) => data(api.delete(`/api/exams/${id}`)),
}

export const MarkApi = {
  roster: (examId) => data(api.get(`/api/marks/exam/${examId}`)),
  save: (examId, body) => data(api.post(`/api/marks/exam/${examId}`, body)),
}

export const NoticeApi = {
  list: () => data(api.get('/api/notices')),
  create: (body) => data(api.post('/api/notices', body)),
  remove: (id) => data(api.delete(`/api/notices/${id}`)),
}

export const HolidayApi = {
  list: () => data(api.get('/api/holidays')),
  create: (body) => data(api.post('/api/holidays', body)),
  remove: (id) => data(api.delete(`/api/holidays/${id}`)),
}

export const StatsApi = {
  stats: () => data(api.get('/api/dashboard/stats')),
  audit: (page) => data(api.get('/api/audit', { params: { page, size: 20 } })),
}

export const MeApi = {
  summary: () => data(api.get('/api/me/summary')),
  profile: () => data(api.get('/api/me/profile')),
  attendance: () => data(api.get('/api/me/attendance')),
  marks: () => data(api.get('/api/me/marks')),
  exams: () => data(api.get('/api/me/exams')),
  admitCard: () => data(api.get('/api/me/admit-card')),
  notices: () => data(api.get('/api/me/notices')),
  holidays: () => data(api.get('/api/me/holidays')),
}
