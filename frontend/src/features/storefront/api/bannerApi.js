import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getBanners() {
  const response = await apiClient(endpoints.banners)

  return response.data ?? []
}
