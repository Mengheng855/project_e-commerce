import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, updateOrderStatus } from '../api/orderApi'
import { Pagination } from '../../../shared/components/Pagination'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'failed']
const filters = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Failed']
const perPage = 10
const sortOptions = [
  { label: 'Newest first', value: 'created_desc' },
  { label: 'Oldest first', value: 'created_asc' },
  { label: 'Total low-high', value: 'total_asc' },
  { label: 'Total high-low', value: 'total_desc' },
]

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '-'
}

function formatCustomer(user) {
  if (!user) return '-'
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return fullName || user.username || user.email || '-'
}

function isToday(value) {
  if (!value) return false

  const date = new Date(value)
  const today = new Date()

  return date.toDateString() === today.toDateString()
}

function statusCount(orders, status) {
  return orders.filter((order) => order.status?.toLowerCase() === status).length
}

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

function paymentLabel(order) {
  const payment = order.payment_transactions?.[0]
  const method = payment?.payment_method ?? 'cash'

  if (method === 'khqr' || method === 'bakong') return 'KHQR Bakong'
  if (method === 'telegram') return 'Telegram'
  if (method === 'cash') return 'COD'

  return method.toUpperCase()
}

function ViewIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
}

function sortOrders(orders, sortBy) {
  const sortedOrders = [...orders]

  return sortedOrders.sort((firstOrder, secondOrder) => {
    if (sortBy === 'created_asc') return new Date(firstOrder.created_at ?? 0) - new Date(secondOrder.created_at ?? 0)
    if (sortBy === 'total_asc') return Number(firstOrder.total_amount) - Number(secondOrder.total_amount)
    if (sortBy === 'total_desc') return Number(secondOrder.total_amount) - Number(firstOrder.total_amount)

    return new Date(secondOrder.created_at ?? 0) - new Date(firstOrder.created_at ?? 0)
  })
}

export function OrderTable() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [savingOrderId, setSavingOrderId] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const response = await getOrders()
        const data = response?.data ?? []
        if (active) setOrders(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load orders:', error)
        if (active) setOrders([])
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const orderStats = useMemo(() => {
    const revenue = orders.reduce((total, order) => total + Number(order.total_amount ?? 0), 0)

    return [
      { label: 'Total orders', value: orders.length, detail: 'All time', color: 'teal' },
      { label: 'Pending', value: statusCount(orders, 'pending'), detail: 'Need follow up', color: 'amber' },
      { label: 'Today', value: orders.filter((order) => isToday(order.created_at)).length, detail: 'New today', color: 'sky' },
      { label: 'Revenue', value: formatCurrency(revenue), detail: 'From loaded orders', color: 'green' },
    ]
  }, [orders])

  const statStyles = {
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    sky: 'border-sky-200 bg-sky-50 text-sky-800',
    teal: 'border-teal-200 bg-teal-50 text-teal-800',
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filteredItems = orders.filter((order) => {
      const status = order.status?.toLowerCase() ?? ''
      const matchesStatus = activeFilter === 'All' || status === activeFilter.toLowerCase()
      const matchesSearch = !normalizedSearch || [
        order.order_number,
        order.status,
        order.user?.username,
        order.user?.email,
        order.user?.first_name,
        order.user?.last_name,
        ...(order.items ?? []).map((item) => item.product_name),
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch))

      return matchesStatus && matchesSearch
    })

    return sortOrders(filteredItems, sortBy)
  }, [activeFilter, orders, search, sortBy])

  useEffect(() => setCurrentPage(1), [activeFilter, search, sortBy])


  async function handleStatusChange(order, status) {
    if (!order?.id || order.status === status || savingOrderId) return

    setStatusError('')
    setSavingOrderId(order.id)

    try {
      const updatedOrder = await updateOrderStatus(order.id, status)
      setOrders((currentOrders) => currentOrders.map((currentOrder) => (
        currentOrder.id === order.id ? { ...currentOrder, ...updatedOrder } : currentOrder
      )))
    } catch (error) {
      setStatusError(error?.message ?? 'Could not update order status.')
    } finally {
      setSavingOrderId(null)
    }
  }

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredOrders.slice(start, start + perPage)
  }, [currentPage, filteredOrders])

  return (
    <div className="grid max-w-full gap-5 overflow-hidden">
      <section className="overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-amber-700">Sales</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Orders</h1>
          </div>
          <div className="rounded-md border border-amber-200 bg-white/80 px-4 py-3 text-sm font-black text-slate-700 shadow-sm">
            {isLoading ? 'Loading...' : filteredOrders.length + ' orders'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orderStats.map((stat) => (
          <div className={(statStyles[stat.color] ?? statStyles.teal) + ' rounded-lg border p-5 shadow-sm'} key={stat.label}>
            <p className="text-sm font-black opacity-80">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{isLoading ? '...' : stat.value}</p>
            <p className="mt-2 text-sm font-bold">{stat.detail}</p>
          </div>
        ))}
      </section>

      {statusError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {statusError}
        </div>
      ) : null}

      <section className="grid max-w-full gap-3 overflow-hidden xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
        <input
          className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, product"
          type="search"
          value={search}
        />
        <select
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
          onChange={(event) => setSortBy(event.target.value)}
          value={sortBy}
        >
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <div className="flex max-w-full flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={(activeFilter === filter ? 'bg-teal-800 text-white ' : 'bg-white text-teal-900 ') + 'rounded-md border border-teal-800 px-3 py-2 text-sm font-black'}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <ScrollableTable>
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-amber-50/70 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">No.</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="8">Loading orders...</td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="8">No orders found.</td></tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr className="text-slate-700 transition hover:bg-slate-50" key={order.id ?? order.order_number}>
                    <td className="px-5 py-3 font-black text-slate-500">{(currentPage - 1) * perPage + index + 1}</td>
                    <td className="px-5 py-3 font-black text-slate-950">{order.order_number ?? '#' + order.id}</td>
                    <td className="px-5 py-3 font-semibold">{formatCustomer(order.user)}</td>
                    <td className="px-5 py-3 font-semibold">{order.items?.length ?? 0}</td>
                    <td className="px-5 py-3">
                      <select
                        aria-label="Update order status"
                        className={'h-9 rounded-md border border-transparent px-2 text-xs font-black capitalize outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20 ' + statusClass(order.status)}
                        disabled={savingOrderId === order.id}
                        onChange={(event) => handleStatusChange(order, event.target.value)}
                        value={order.status ?? 'pending'}
                      >
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{paymentLabel(order)}</span></td>
                    <td className="px-5 py-3 font-black text-slate-950">{formatCurrency(order.total_amount)}</td>
                    <td className="px-5 py-3 font-semibold">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-3">
                      <Link aria-label="View order" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-teal-700 hover:border-teal-700 hover:bg-teal-50" title="View order" to={'/admin/orders/' + order.id}>
                        <ViewIcon />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollableTable>
      </section>

      <Pagination currentPage={currentPage} onPageChange={setCurrentPage} perPage={perPage} total={filteredOrders.length} />
    </div>
  )
}
