import axios from 'axios'

const STORAGE_KEY = 'sms.auth'

/** Session lives in sessionStorage so it is dropped when the tab closes. */
export const authStore = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    } catch {
      return null
    }
  },
  set(value) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  clear() {
    sessionStorage.removeItem(STORAGE_KEY)
  },
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const auth = authStore.get()
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const code = error.response?.data?.code
    const url = error.config?.url || ''
    if (status === 401 && !url.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('sms:unauthorized'))
    }
    if (status === 403 && code === 'PASSWORD_CHANGE_REQUIRED') {
      window.dispatchEvent(new Event('sms:must-change'))
    }
    return Promise.reject(error)
  },
)

export const errMsg = (error) =>
  error?.response?.data?.message ||
  (error?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : error?.message) ||
  'Something went wrong'

export default api
