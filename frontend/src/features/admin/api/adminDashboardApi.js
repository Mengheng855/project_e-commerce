import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

async function readCollection(path, params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient(query ? path + '?' + query : path)

  return {
    data: response?.data ?? [],
    meta: response?.meta ?? null,
  }
}

export async function getAdminDashboardData() {
  const [products, categories, brands, orders, users] = await Promise.allSettled([
    readCollection(endpoints.products, { per_page: 50 }),
    readCollection(endpoints.categories, { per_page: 50 }),
    readCollection(endpoints.brands, { per_page: 50 }),
    readCollection(endpoints.orders, { per_page: 50 }),
    readCollection(endpoints.users, { per_page: 50 }),
  ])

  return {
    products: products.status === 'fulfilled' ? products.value : { data: [], meta: null },
    categories: categories.status === 'fulfilled' ? categories.value : { data: [], meta: null },
    brands: brands.status === 'fulfilled' ? brands.value : { data: [], meta: null },
    orders: orders.status === 'fulfilled' ? orders.value : { data: [], meta: null },
    users: users.status === 'fulfilled' ? users.value : { data: [], meta: null },
    errors: {
      products: products.status === 'rejected' ? products.reason : null,
      categories: categories.status === 'rejected' ? categories.reason : null,
      brands: brands.status === 'rejected' ? brands.reason : null,
      orders: orders.status === 'rejected' ? orders.reason : null,
      users: users.status === 'rejected' ? users.reason : null,
    },
  }
}
