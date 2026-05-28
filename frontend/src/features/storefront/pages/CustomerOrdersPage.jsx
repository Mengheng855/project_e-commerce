import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../../products/api/productApi'
import { getOrders, updateOrderStatus } from '../../orders/api/orderApi'
import { useAuth } from '../../../shared/hooks/useAuth'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { assetUrl } from '../../../shared/utils/assetUrl'

const statusSteps = ['pending', 'paid', 'shipped', 'delivered']

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-'
}

function statusTone(status) {
  if (status === 'delivered' || status === 'paid') return 'bg-teal-50 text-teal-800 border-teal-200'
  if (status === 'shipped') return 'bg-sky-50 text-sky-800 border-sky-200'
  if (status === 'cancelled' || status === 'failed') return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

function paymentLabel(order) {
  const payment = order.payment_transactions?.[0]
  const method = payment?.payment_method ?? order.payment_method ?? 'cash'

  if (method === 'khqr' || method === 'bakong') return 'KHQR Bakong'
  if (method === 'telegram') return 'Telegram order'
  if (method === 'cash') return 'Cash on delivery'
  return method.toUpperCase()
}

function paymentStatus(order) {
  return order.payment_transactions?.[0]?.status ?? 'pending'
}

function SkeletonOrders() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div className="rounded-lg border border-teal-900/10 bg-white p-5 shadow-sm" key={item}>
          <div className="skeleton-shimmer h-5 w-40 rounded" />
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="skeleton-shimmer h-16 rounded" />
            <div className="skeleton-shimmer h-16 rounded" />
            <div className="skeleton-shimmer h-16 rounded" />
            <div className="skeleton-shimmer h-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function OrderTimeline({ status }) {
  const isBadStatus = status === 'cancelled' || status === 'failed'
  const currentIndex = Math.max(statusSteps.indexOf(status), 0)

  if (isBadStatus) {
    return <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-700">This order is {status}.</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {statusSteps.map((step, index) => {
        const active = currentIndex >= index
        const complete = currentIndex > index
        return (
          <div className="flex items-center gap-2" key={step}>
            <span className={(active ? 'border-teal-800 bg-teal-800' : 'border-slate-300 bg-white') + ' flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2'}>
              {complete ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </span>
            <span className={(active ? 'text-teal-900' : 'text-slate-500') + ' text-xs font-black uppercase'}>
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function OrderItemThumbnail({ item, product }) {
  const [hasImageError, setHasImageError] = useState(false)
  const image = assetUrl(item.product_image ?? product?.image)
  const fallbackText = (item.product_name ?? product?.name ?? 'TT').slice(0, 2).toUpperCase()

  if (!image || hasImageError) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-teal-900/10 bg-teal-900 text-sm font-black text-white">
        {fallbackText}
      </div>
    )
  }

  return (
    <img
      alt={item.product_name ?? product?.name ?? 'Order item'}
      className="h-20 w-20 shrink-0 rounded-md border border-teal-900/10 bg-slate-100 object-cover"
      loading="lazy"
      onError={() => setHasImageError(true)}
      src={image}
    />
  )
}

function OrderCard({ cancelError, isCancelling, onCancel, order, productById }) {
  const items = order.items ?? order.order_items ?? []
  const canCancel = order.status === 'pending'

  return (
    <article className="rounded-lg border border-teal-900/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-teal-900/10 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-teal-700">Order</p>
          <h2 className="mt-1 text-xl font-black text-teal-950">{order.order_number}</h2>
          <p className="mt-1 text-sm font-semibold text-teal-900/65">Created {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canCancel ? (
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-black text-red-700 hover:border-red-700 hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isCancelling}
              onClick={() => onCancel(order)}
              type="button"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel order'}
            </button>
          ) : null}
          <span className={statusTone(order.status) + ' w-fit rounded-full border px-3 py-1 text-sm font-black capitalize'}>
            {order.status}
          </span>
        </div>
      </div>

      {cancelError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{cancelError}</p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md border border-teal-900/10 p-3">
          <p className="text-xs font-black uppercase text-teal-700">Total</p>
          <p className="mt-1 text-lg font-black text-teal-950">{formatCurrency(order.total_amount)}</p>
        </div>
        <div className="rounded-md border border-teal-900/10 p-3">
          <p className="text-xs font-black uppercase text-teal-700">Payment</p>
          <p className="mt-1 text-sm font-black text-teal-950">{paymentLabel(order)}</p>
        </div>
        <div className="rounded-md border border-teal-900/10 p-3">
          <p className="text-xs font-black uppercase text-teal-700">Payment status</p>
          <p className="mt-1 text-sm font-black capitalize text-teal-950">{paymentStatus(order)}</p>
        </div>
        <div className="rounded-md border border-teal-900/10 p-3">
          <p className="text-xs font-black uppercase text-teal-700">Items</p>
          <p className="mt-1 text-sm font-black text-teal-950">{items.length || '-'}</p>
        </div>
      </div>

      <div className="mt-4">
        <OrderTimeline status={order.status} />
      </div>

      <div className="mt-4 divide-y divide-teal-900/10 rounded-md border border-teal-900/10">
        {items.length ? items.map((item) => {
          const selected = item.selected_options ?? []
          const product = productById.get(item.product_id)
          const productPath = product?.slug ? '/products/' + product.slug : null

          return (
            <div className="flex flex-col gap-3 p-3 text-sm sm:flex-row sm:items-center sm:justify-between" key={item.id}>
              <div className="flex min-w-0 gap-3">
                <OrderItemThumbnail item={item} product={product} />
                <div className="min-w-0">
                  {productPath ? (
                    <Link className="font-black text-teal-950 hover:text-teal-700" to={productPath}>
                      {item.product_name}
                    </Link>
                  ) : (
                    <p className="font-black text-teal-950">{item.product_name}</p>
                  )}
                  {selected.length ? (
                    <p className="mt-1 font-semibold text-teal-900/65">
                      {selected.map((option) => `${option.type}: ${option.value}`).join(', ')}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-black uppercase text-teal-700">Qty {item.qty}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-black text-teal-950">{formatCurrency(Number(item.price) * Number(item.qty))}</p>
                {selected.length ? (
                  <p className="mt-1 text-xs font-bold text-teal-900/60">{item.qty} x {formatCurrency(item.price)}</p>
                ) : null}
              </div>
            </div>
          )
        }) : (
          <p className="p-3 text-sm font-semibold text-teal-900/65">No item details found.</p>
        )}
      </div>
    </article>
  )
}

export function CustomerOrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [cancelingOrderId, setCancelingOrderId] = useState(null)
  const [cancelErrorByOrderId, setCancelErrorByOrderId] = useState({})

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true

    async function loadOrders() {
      setIsLoading(true)
      setError('')

      try {
        const [orderResponse, productResponse] = await Promise.all([
          getOrders(),
          getProducts({ per_page: 50 }),
        ])
        if (active) {
          setOrders(orderResponse?.data ?? [])
          setProducts(productResponse?.data ?? productResponse ?? [])
        }
      } catch (error) {
        if (active) setError(error?.message ?? 'Could not load your orders.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadOrders()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  const orderCount = useMemo(() => orders.length, [orders])
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  async function handleCancelOrder(order) {
    if (!order?.id || order.status !== 'pending' || cancelingOrderId) return

    const confirmed = window.confirm('Cancel this pending order?')
    if (!confirmed) return

    setCancelingOrderId(order.id)
    setCancelErrorByOrderId((current) => ({ ...current, [order.id]: '' }))

    try {
      const updatedOrder = await updateOrderStatus(order.id, 'cancelled')
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, ...updatedOrder } : item)))
    } catch (error) {
      const message = error?.message ?? 'Could not cancel this order. Please contact the shop if it has already been accepted.'
      setCancelErrorByOrderId((current) => ({ ...current, [order.id]: message }))
    } finally {
      setCancelingOrderId(null)
    }
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-5">
        <div className="flex flex-col justify-between gap-4 border-b border-teal-900/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Order tracking</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-teal-950">Your orders</h1>
            <p className="mt-3 text-sm font-semibold text-teal-900/70">Track status, payment, and selected product options after checkout.</p>
          </div>
          <Link className="w-fit rounded-md border border-teal-800 px-4 py-2 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white" to="/products">
            Continue shopping
          </Link>
        </div>

        <div className="mt-6">
          {isLoading || isAuthLoading ? <SkeletonOrders /> : null}
          {!isLoading && error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">{error}</div> : null}
          {!isLoading && !error && !orderCount ? (
            <div className="rounded-lg border border-teal-900/10 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-black text-teal-950">No orders yet</h2>
              <p className="mt-2 text-sm font-semibold text-teal-900/65">When you checkout, your order history will appear here.</p>
              <Link className="mt-5 inline-flex rounded-md bg-teal-800 px-4 py-2 text-sm font-black text-white hover:bg-teal-900" to="/products">
                Shop products
              </Link>
            </div>
          ) : null}
          {!isLoading && !error && orderCount ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard
                  cancelError={cancelErrorByOrderId[order.id]}
                  isCancelling={cancelingOrderId === order.id}
                  key={order.id}
                  onCancel={handleCancelOrder}
                  order={order}
                  productById={productById}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
