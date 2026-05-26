import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getBanners() {
  const response = await apiClient(endpoints.adminBanners)
  return response.data ?? []
}

export async function getBanner(id) {
  const response = await apiClient(endpoints.adminBanners + '/' + id)
  return response.data ?? null
}

export async function deleteBanner(id) {
  await apiClient(endpoints.adminBanners + '/' + id, { method: 'DELETE' })
}

export async function uploadBannerImages(files) {
  const formData = new FormData()
  Array.from(files).forEach((file) => formData.append('images[]', file))

  const response = await apiClient(endpoints.adminBannerImages, {
    method: 'POST',
    body: formData,
  })

  return response.data ?? []
}

export async function updateBanner(id, data) {
  const response = await apiClient(endpoints.adminBanners + '/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data ?? null
}

export async function createBanner(data) {
  const response = await apiClient(endpoints.adminBanners, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data ?? null
}
