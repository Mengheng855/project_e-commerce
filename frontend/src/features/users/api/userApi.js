import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient(query ? endpoints.users + '?' + query : endpoints.users)
  return response.data ?? []
}

export async function getUser(id) {
  const response = await apiClient(endpoints.users + '/' + id)
  return response.data
}

export async function createUser(payload) {
  const response = await apiClient(endpoints.users, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateUser(id, payload) {
  const response = await apiClient(endpoints.users + '/' + id, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteUser(id) {
  return apiClient(endpoints.users + '/' + id, { method: 'DELETE' })
}
