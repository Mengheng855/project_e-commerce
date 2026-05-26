import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getCategories(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient(query ? endpoints.categories + '?' + query : endpoints.categories)

  return response.data ?? []
}

export async function getCategory(slug) {
  const response = await apiClient(endpoints.categories + '/' + slug)

  return response.data
}

export async function createCategory(payload) {
  const response = await apiClient(endpoints.categories, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateCategory(slug, payload) {
  const response = await apiClient(endpoints.categories + '/' + slug, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteCategory(slug) {
  return apiClient(endpoints.categories + '/' + slug, { method: 'DELETE' })
}

export const getCategorys = getCategories
