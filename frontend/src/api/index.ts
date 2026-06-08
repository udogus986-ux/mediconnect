import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://mediconnect-production-a6b2.up.railway.app/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// --- AUTH ---
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// --- DOCTORS ---
export const doctorAPI = {
  getAll: (params?: { specialty?: string; city?: string; search?: string }) =>
    api.get('/doctors', { params }),
  getOne: (id: string) => api.get(`/doctors/${id}`),
  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get('/doctors/nearby', { params: { lat, lng, radius } }),
  createProfile: (data: object) => api.post('/doctors', data),
  updateProfile: (data: object) => api.put('/doctors', data),
}

// --- APPOINTMENTS ---
export const appointmentAPI = {
  create: (data: { doctorId: string; date: string; time: string; notes?: string }) =>
    api.post('/appointments', data),
  getMyAppointments: () => api.get('/appointments/my'),
  updateStatus: (id: string, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
}

// --- MESSAGES ---
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}`),
  createConversation: (participantId: string) =>
    api.post('/messages/conversations', { participantId }),
}
// --- REVIEWS ---
export const reviewAPI = {
  create: (data: {
    appointmentId: string
    communicationRating: number
    expertiseRating: number
    punctualityRating: number
  }) => api.post('/reviews', data),
  getDoctorReviews: (doctorId: string) => api.get(`/reviews/doctor/${doctorId}`),
  getReviewable: () => api.get('/reviews/reviewable'),
}
// --- ANALYTICS ---
export const analyticsAPI = {
  getDoctorAnalytics: () => api.get('/analytics/doctor'),
}
export default api