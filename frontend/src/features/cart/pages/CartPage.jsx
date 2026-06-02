import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkoutCart, clearCart, deleteCartItem, getCart, updateCartItem } from '../api/cartApi'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { useAuth } from '../../../shared/hooks/useAuth'

function itemImage(item) {
  return item.product?.image ? assetUrl(item.product.image) : null
}

export function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const isBakongDisabled = true
  const [cart, setCart] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [success, setSuccess] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('telegram')

  const items = useMemo(() => cart?.items ?? [], [cart])

  useEffect(() => {
    if (isAuthLoading) return

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    let active = true

    async function loadCart() {
      setError('')
      setIsLoading(true)
      try {
        const data = await getCart()
        if (active) setCart(data)
      } catch (error) {
        if (active) setError(error?.message ?? 'Could not load cart.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadCart()
    return () => { active = false }
  }, [isAuthenticated, isAuthLoading, navigate])

  async function changeQty(item, nextQty) {
    if (nextQty < 1 || updatingId) return

    setError('')
    setUpdatingId(item.id)
    try {
      const data = await updateCartItem(item.id, { qty: nextQty })
      setCart(data)
    } catch (error) {
      const firstFieldError = error?.errors ? Object.values(error.errors).flat()[0] : null
      setError(firstFieldError ?? error?.message ?? 'Could not update quantity.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function removeItem(item) {
    if (updatingId) return

    setError('')
    setUpdatingId(item.id)
    try {
      const data = await deleteCartItem(item.id)
      setCart(data)
    } catch (error) {
      setError(error?.message ?? 'Could not remove item.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCheckout() {
    if (!items.length || updatingId) return
    if (paymentMethod === 'bakong' && isBakongDisabled) {
      setError('KH Bakong payment is temporarily disabled. Please order by Telegram.')
      return
    }

    setError('')
    setSuccess('')
    setUpdatingId('checkout')

    if (!user?.profile?.phone_number) {
      setUpdatingId(null)
      navigate('/profile?need_phone=1&return_to=/cart')
      return
    }

    try {
      const order = await checkoutCart({ payment_method: paymentMethod, currency: 'USD' })
      setCart({ items: [], items_count: 0, total: '0.00' })
      if (paymentMethod === 'bakong') {
        navigate(`/payments/bakong/${order.id}`)
        return
      }

      setSuccess('Order successful. We sent it to Telegram and will contact you soon.')
    } catch (error) {
      if (error?.errors?.phone_number) {
        setUpdatingId(null)
        navigate('/profile?need_phone=1&return_to=/cart')
        return
      }

      const firstFieldError = error?.errors ? Object.values(error.errors).flat()[0] : null
      setError(firstFieldError ?? error?.message ?? 'Could not checkout cart.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleClearCart() {
    if (!items.length || updatingId) return

    setError('')
    setUpdatingId('clear')
    try {
      const data = await clearCart()
      setCart(data)
    } catch (error) {
      setError(error?.message ?? 'Could not clear cart.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (isAuthLoading || isLoading) {
    return <div className="mx-auto max-w-7xl px-5 py-12 text-sm font-black text-teal-900">Loading cart...</div>
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10">
      <div className="flex flex-col justify-between gap-4 border-b border-teal-900/15 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Shopping cart</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-teal-950">Your cart</h1>
          <p className="mt-2 text-sm font-semibold text-teal-900/70">Review products, selected options, quantity, and total.</p>
        </div>
        <Link className="w-fit rounded-md border border-teal-800 px-4 py-2 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white" to="/products">
          Continue shopping
        </Link>
      </div>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
      {success ? <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700">{success}</p> : null}

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-teal-900/20 bg-white px-5 py-16 text-center">
          <div>
            <h2 className="text-2xl font-black text-teal-950">Your cart is empty</h2>
            <p className="mt-2 text-sm font-semibold text-teal-900/70">Add electronics you like, then come back here to review them.</p>
            <Link className="mt-5 inline-flex rounded-md bg-teal-800 px-5 py-3 text-sm font-black text-white hover:bg-teal-900" to="/products">
              Shop products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            {items.map((item) => {
              const image = itemImage(item)
              const isUpdating = updatingId === item.id

              return (
                <article className="grid items-start gap-4 rounded-lg border border-teal-900/15 bg-white p-4 shadow-sm md:grid-cols-[96px_1fr_auto]" key={item.id}>
                  <Link className="block h-24 w-24 self-start overflow-hidden rounded-md border border-teal-900/15 bg-white" to={'/products/' + item.product?.slug}>
                    {image ? (
                      <img alt={item.product?.name} className="h-full w-full object-cover" src={image} />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-teal-800 text-xl font-black text-white">TV</div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link className="text-lg font-black text-teal-950 hover:text-teal-700" to={'/products/' + item.product?.slug}>{item.product?.name}</Link>
                    {item.variant_label ? <p className="mt-1 text-sm font-semibold text-teal-900/70">{item.variant_label}</p> : null}
                    {item.selected_options?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.selected_options.map((option) => (
                          <span className="inline-flex items-center gap-2 rounded-md border border-teal-900/15 px-2 py-1 text-xs font-black text-teal-900" key={option.type + option.value}>
                            {option.color_hex ? <span className="h-3 w-3 rounded-full border border-teal-900/20" style={{ backgroundColor: option.color_hex }} /> : null}
                            {option.type}: {option.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-2 text-sm font-bold text-teal-900/70">Unit price: <span className="text-teal-950">{formatCurrency(item.unit_price)}</span></p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 md:flex-col md:items-end">
                    <div className="flex h-10 w-fit items-center overflow-hidden rounded-md border border-teal-900/20">
                      <button className="h-10 px-3 text-lg font-black text-teal-900 hover:bg-teal-50 disabled:opacity-40" disabled={isUpdating || item.qty <= 1} onClick={() => changeQty(item, item.qty - 1)} type="button">-</button>
                      <span className="min-w-10 px-3 text-center text-sm font-black text-teal-950">{item.qty}</span>
                      <button className="h-10 px-3 text-lg font-black text-teal-900 hover:bg-teal-50 disabled:opacity-40" disabled={isUpdating} onClick={() => changeQty(item, item.qty + 1)} type="button">+</button>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-lg font-black text-teal-950">{formatCurrency(item.subtotal)}</p>
                      <button className="mt-2 text-sm font-black text-red-600 hover:text-red-800 disabled:opacity-40" disabled={isUpdating} onClick={() => removeItem(item)} type="button">
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="h-fit rounded-lg border border-teal-900/15 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-teal-950">Order summary</h2>
            <div className="mt-5 grid gap-3 border-b border-teal-900/10 pb-5 text-sm font-bold text-teal-900/75">
              <div className="flex items-center justify-between gap-3">
                <span>Items</span>
                <span className="text-teal-950">{cart?.items_count ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="text-teal-950">{formatCurrency(cart?.total ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Shipping</span>
                <span className="text-teal-950">Calculated later</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-black uppercase tracking-wide text-teal-800">Total</span>
              <span className="text-2xl font-black text-teal-950">{formatCurrency(cart?.total ?? 0)}</span>
            </div>

            <div className="mt-5 border-t border-teal-900/10 pt-5">
              <p className="text-sm font-black uppercase tracking-wide text-teal-800">Payment method</p>
              <div className="mt-3 grid gap-3">
                <label className={(paymentMethod === 'telegram' ? 'border-teal-800 bg-teal-50 ' : 'border-teal-900/15 bg-white ') + 'cursor-pointer rounded-lg border p-3'}>
                  <span className="flex items-start gap-3">
                    <input checked={paymentMethod === 'telegram'} className="mt-1" onChange={() => setPaymentMethod('telegram')} type="radio" />
                    <span>
                      <span className="block text-sm font-black text-teal-950">Order by Telegram</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-teal-900/70">Send order to admin Telegram. We contact you to confirm.</span>
                    </span>
                  </span>
                </label>
                <label className={(paymentMethod === 'bakong' ? 'border-teal-800 bg-teal-50 ' : 'border-teal-900/15 bg-white ') + (isBakongDisabled ? 'cursor-not-allowed opacity-55 ' : 'cursor-pointer ') + 'rounded-lg border p-3'}>
                  <span className="flex items-start gap-3">
                    <input checked={paymentMethod === 'bakong'} className="mt-1" disabled={isBakongDisabled} onChange={() => setPaymentMethod('bakong')} type="radio" />
                    <span>
                      <span className="block text-sm font-black text-teal-950">KH Bakong</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-teal-900/70">Show KHQR code so you can scan and pay.</span>
                    </span>
                  </span>
                </label>
              </div>
              {paymentMethod === 'bakong' ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-900">
                  Tap checkout to create the order, then scan the KHQR Bakong code.
                </div>
              ) : null}
            </div>

            <button className="mt-5 h-12 w-full rounded-md bg-teal-800 text-sm font-black text-white hover:bg-teal-900 disabled:opacity-50" disabled={updatingId === 'checkout'} onClick={handleCheckout} type="button">
              {updatingId === 'checkout' ? 'Checking out...' : paymentMethod === 'bakong' ? 'Pay with KHQR Bakong' : 'Order by Telegram'}
            </button>
            <button className="mt-3 h-10 w-full rounded-md border border-red-200 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-40" disabled={updatingId === 'clear'} onClick={handleClearCart} type="button">
              Clear cart
            </button>
          </aside>
        </div>
      )}

    </section>
  )
}
