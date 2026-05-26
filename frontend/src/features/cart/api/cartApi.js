import { apiClient } from '../../../shared/api/client'
import { endpoints } from '../../../shared/api/endpoints'

export async function getCart() {
  const response = await apiClient(endpoints.cart)

  return response.data
}

export async function addCartItem(payload) {
  const response = await apiClient(endpoints.cartItems, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateCartItem(id, payload) {
  const response = await apiClient(endpoints.cartItems + '/' + id, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteCartItem(id) {
  const response = await apiClient(endpoints.cartItems + '/' + id, { method: 'DELETE' })

  return response.data
}

export async function clearCart() {
  const response = await apiClient(endpoints.cart, { method: 'DELETE' })

  return response.data
}

export async function checkoutCart(payload = {}) {
  const response = await apiClient(endpoints.cartCheckout, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function confirmBakongPayment(orderId) {
  const response = await apiClient(endpoints.confirmBakongPayment(orderId), {
    method: 'POST',
  })

  return response.data
}
