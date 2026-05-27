const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const API_ORIGIN = /^https?:\/\//.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/v\d+\/?$/, '')
  : ''

export function assetUrl(value) {
  if (!value) return value

  if (value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value)
      const isStorageUrl = url.pathname.startsWith('/storage/')

      if (isStorageUrl) {
        return API_ORIGIN + url.pathname + url.search + url.hash
      }
    } catch {
      return value
    }

    return value
  }

  if (value.startsWith('/')) {
    return API_ORIGIN + value
  }

  if (value.startsWith('storage/')) {
    return API_ORIGIN + '/' + value
  }

  return value
}
