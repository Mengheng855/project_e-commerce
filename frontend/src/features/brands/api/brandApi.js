import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getBrands(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient(query ? endpoints.brands + '?' + query : endpoints.brands)

  return response.data ?? []
}

export async function getBrand(slug) {
  const response = await apiClient(endpoints.brands + '/' + slug)

  return response.data
}

export async function createBrand(payload) {
  const response = await apiClient(endpoints.brands, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateBrand(slug, payload) {
  const response = await apiClient(endpoints.brands + '/' + slug, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteBrand(slug) {
  return apiClient(endpoints.brands + '/' + slug, { method: 'DELETE' })
}
