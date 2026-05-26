import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getActiveLogo() {
  const response = await apiClient(endpoints.logo)
  return response.data ?? null
}

export async function getLogos() {
  const response = await apiClient(endpoints.adminLogos)
  return response.data ?? []
}

export async function getLogo(id) {
  const response = await apiClient(endpoints.adminLogos + '/' + id)
  return response.data
}

export async function uploadLogoImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const response = await apiClient(endpoints.adminLogoImage, {
    method: 'POST',
    body: formData,
  })
  return response.data
}

export async function createLogo(payload) {
  const response = await apiClient(endpoints.adminLogos, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateLogo(id, payload) {
  const response = await apiClient(endpoints.adminLogos + '/' + id, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteLogo(id) {
  return apiClient(endpoints.adminLogos + '/' + id, { method: 'DELETE' })
}
