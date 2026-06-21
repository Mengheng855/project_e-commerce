export const CART_COUNT_EVENT = 'cart-count-change'
const CART_COUNT_STORAGE_KEY = 'cart_count'
const CART_COUNT_VERSION_STORAGE_KEY = 'cart_count_version'

export function cartCountFromCart(cart) {
  if (!cart) return 0

  const count = Number(cart.items_count)
  if (Number.isFinite(count)) return count

  return (cart.items ?? []).reduce((total, item) => total + Number(item.qty ?? 1), 0)
}

export function publishCartCount(cartOrCount, options = {}) {
  const count = typeof cartOrCount === 'number' ? cartOrCount : cartCountFromCart(cartOrCount)

  if (typeof window === 'undefined') return count

  const version = Number(options.version ?? Date.now())
  const currentVersion = Number(window.localStorage.getItem(CART_COUNT_VERSION_STORAGE_KEY) ?? 0)

  if (Number.isFinite(currentVersion) && version < currentVersion) {
    return readStoredCartCount()
  }

  window.localStorage.setItem(CART_COUNT_STORAGE_KEY, String(count))
  window.localStorage.setItem(CART_COUNT_VERSION_STORAGE_KEY, String(version))
  window.dispatchEvent(new CustomEvent(CART_COUNT_EVENT, { detail: { count, version } }))

  return count
}

export function readStoredCartCount() {
  if (typeof window === 'undefined') return 0

  const count = Number(window.localStorage.getItem(CART_COUNT_STORAGE_KEY) ?? 0)

  return Number.isFinite(count) ? count : 0
}
