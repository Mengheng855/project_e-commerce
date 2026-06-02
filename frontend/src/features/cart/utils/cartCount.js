export const CART_COUNT_EVENT = 'cart-count-change'

export function cartCountFromCart(cart) {
  if (!cart) return 0

  const count = Number(cart.items_count)
  if (Number.isFinite(count)) return count

  return (cart.items ?? []).reduce((total, item) => total + Number(item.qty ?? 1), 0)
}

export function publishCartCount(cartOrCount) {
  const count = typeof cartOrCount === 'number' ? cartOrCount : cartCountFromCart(cartOrCount)

  if (typeof window === 'undefined') return count

  window.localStorage.setItem('cart_count', String(count))
  window.dispatchEvent(new CustomEvent(CART_COUNT_EVENT, { detail: { count } }))

  return count
}

export function readStoredCartCount() {
  if (typeof window === 'undefined') return 0

  const count = Number(window.localStorage.getItem('cart_count') ?? 0)

  return Number.isFinite(count) ? count : 0
}
