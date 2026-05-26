import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export function getOrders() {
  return apiClient(endpoints.orders)
}

export async function getOrder(id) {
  const response = await apiClient(`${endpoints.orders}/${id}`)
  return response.data ?? null
}



export async function updateOrderStatus(id, status) {
  const response = await apiClient(`${endpoints.orders}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  return response.data ?? null
}
