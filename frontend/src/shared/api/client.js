const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export async function apiClient(path, options = {}) {
  const token = localStorage.getItem('auth_token')
  const isFormData = options.body instanceof FormData

  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw data ?? new Error('Request failed')
  }

  return data
}
