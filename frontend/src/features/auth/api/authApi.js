import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function login(payload) {
  const response = await apiClient(endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify({ device_name: 'web', ...payload }),
  })

  return response.data
}

export async function register(payload) {
  const response = await apiClient(endpoints.auth.register, {
    method: 'POST',
    body: JSON.stringify({ device_name: 'web', ...payload }),
  })

  return response.data
}

export async function verifyEmail(payload) {
  const response = await apiClient(endpoints.auth.verifyEmail, {
    method: 'POST',
    body: JSON.stringify({ device_name: 'web', ...payload }),
  })

  return response.data
}

export async function resendEmailVerification(payload) {
  return apiClient(endpoints.auth.resendEmailVerification, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function forgotPassword(payload) {
  return apiClient(endpoints.auth.forgotPassword, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function resetPassword(payload) {
  return apiClient(endpoints.auth.resetPassword, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCurrentUser() {
  const response = await apiClient(endpoints.auth.me)

  return response.data
}

export async function updateCurrentUser(payload) {
  const response = await apiClient(endpoints.me, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function uploadCurrentUserAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await apiClient(endpoints.meAvatar, {
    method: 'POST',
    body: formData,
  })

  return response.data
}

export async function logout() {
  return apiClient('/auth/logout', { method: 'POST' })
}
