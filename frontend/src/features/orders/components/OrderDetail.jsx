import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder, updateOrderStatus } from '../api/orderApi'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'failed']

function statusClass(status) {
  const colorMap = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-teal-100 text-teal-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    failed: 'bg-red-100 text-red-800',
  }

  return colorMap[status?.toLowerCase()] ?? 'bg-slate-100 text-slate-800'
}

export function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getOrder(id)
        if (active) setOrder(data)
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])


  async function handleStatusChange(status) {
    if (!order?.id || order.status === status || isSavingStatus) return

    setStatusError('')
    setIsSavingStatus(true)

    try {
      const updatedOrder = await updateOrderStatus(order.id, status)
      setOrder((currentOrder) => ({ ...currentOrder, ...updatedOrder }))
    } catch (error) {
      setStatusError(error?.message ?? 'Could not update order status.')
    } finally {
      setIsSavingStatus(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading order...</div>
  }

  if (!order) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Order not found.</div>
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Order</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{order.order_number ?? `Order #${order.id}`}</h1>
          </div>
          <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/orders">
            Back to orders
          </Link>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Status</p>
          <select
            className={'mt-1 h-10 rounded-md border border-transparent px-3 text-sm font-black capitalize outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20 ' + statusClass(order.status)}
            disabled={isSavingStatus}
            onChange={(event) => handleStatusChange(event.target.value)}
            value={order.status ?? 'pending'}
          >
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          {statusError ? <p className="mt-2 text-sm font-bold text-red-700">{statusError}</p> : null}
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Total amount</p>
          <p className="mt-1 font-bold text-teal-700">{formatCurrency(order.total_amount)}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Created at</p>
          <p className="mt-1 font-semibold text-slate-800">{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Updated at</p>
          <p className="mt-1 font-semibold text-slate-800">{order.updated_at ? new Date(order.updated_at).toLocaleString() : '-'}</p>
        </div>
        {order.user && (
          <div className="md:col-span-2">
            <p className="text-xs font-black uppercase text-slate-500">Customer</p>
            <p className="mt-1 font-semibold text-slate-800">
              {order.user.username} ({order.user.email})
            </p>
          </div>
        )}
        {order.payment_transactions?.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-xs font-black uppercase text-slate-500">Payment</p>
            <div className="mt-1 space-y-2">
              {order.payment_transactions.map((tx) => (
                <div key={tx.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-black text-slate-950">{tx.payment_method}</span>
                    <span className={`rounded px-2 py-1 text-xs font-black ${tx.status === 'paid' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(tx.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {order.items?.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">Order items</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-slate-950">{item.product_name}</p>
                    {item.variant_label && (
                      <p className="text-sm text-slate-600">{item.variant_label}</p>
                    )}
                    {item.delivery_address && (
                      <p className="mt-1 text-xs text-slate-500"> Delivery: {item.delivery_address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-950">{formatCurrency(item.price)} × {item.qty}</p>
                    <p className="mt-1 text-sm font-semibold text-teal-700">{formatCurrency(Number(item.price) * item.qty)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

