export const storage = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token) => localStorage.setItem('auth_token', token),
  clearToken: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('admin_session')
  },
  isAdminSession: () => localStorage.getItem('admin_session') === 'true',
  setAdminSession: (isAdminSession) => localStorage.setItem('admin_session', String(isAdminSession)),
}
