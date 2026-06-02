import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient(query ? endpoints.products + '?' + query : endpoints.products)

  return response.data ?? []
}

export async function getProduct(slug) {
  const response = await apiClient(endpoints.products + '/' + slug)

  return response.data
}

export async function getAdminProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient(query ? endpoints.adminProducts + '?' + query : endpoints.adminProducts)

  return response.data ?? []
}

export async function getAdminProduct(slug) {
  const response = await apiClient(endpoints.adminProducts + '/' + slug)

  return response.data
}

export async function getVariantTypes() {
  const response = await apiClient(endpoints.variantTypes)

  return response.data ?? []
}

export async function uploadProductImages(files) {
  const formData = new FormData()
  Array.from(files).forEach((file) => formData.append('images[]', file))

  const response = await apiClient(endpoints.productImages, {
    method: 'POST',
    body: formData,
  })

  return response.data ?? []
}

export async function createProduct(payload) {
  const response = await apiClient(endpoints.products, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteProduct(slug) {
  return apiClient(endpoints.products + '/' + slug, { method: 'DELETE' })
}

export async function updateProduct(slug, payload) {
  const response = await apiClient(endpoints.products + '/' + slug, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function createVariantType(payload) {
  const response = await apiClient(endpoints.variantTypes, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateVariantType(id, payload) {
  const response = await apiClient(endpoints.variantTypes + '/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteVariantType(id) {
  return apiClient(endpoints.variantTypes + '/' + id, { method: 'DELETE' })
}
