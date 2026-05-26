import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardData } from '../api/adminDashboardApi'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

const emptyDashboard = {
  products: { data: [], meta: null },
  categories: { data: [], meta: null },
  brands: { data: [], meta: null },
  orders: { data: [], meta: null },
  users: { data: [], meta: null },
  errors: {},
}

function totalOf(collection) {
  return collection.meta?.total ?? collection.data.length
}

function SectionTable({ accent = 'teal', columns, emptyText, rows, title }) {
  const accentClasses = {
    amber: 'border-amber-200 bg-amber-50/45 text-amber-900',
    blue: 'border-sky-200 bg-sky-50/55 text-sky-900',
    teal: 'border-teal-200 bg-teal-50/55 text-teal-900',
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={(accentClasses[accent] ?? accentClasses.teal) + ' border-b px-5 py-4'}>
        <h2 className="text-base font-black">{title}</h2>
      </div>
      <ScrollableTable>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50/80 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="px-5 py-3" key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length ? rows.map((row) => (
              <tr className="text-slate-700 transition hover:bg-slate-50/70" key={row.id ?? row.slug ?? row.order_number}>
                {columns.map((column) => (
                  <td className="px-5 py-3 font-medium" key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-5 py-6 text-center font-semibold text-slate-500" colSpan={columns.length}>{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollableTable>
    </section>
  )
}

export function AdminHomePage() {
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const data = await getAdminDashboardData()
        if (active) {
          setDashboard(data)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const revenue = useMemo(() => {
    return dashboard.orders.data.reduce((total, order) => total + Number(order.total_amount ?? 0), 0)
  }, [dashboard.orders.data])

  const stats = [
    { label: 'Products', value: totalOf(dashboard.products), detail: 'Catalog items', color: 'teal' },
    { label: 'Orders', value: totalOf(dashboard.orders), detail: formatCurrency(revenue) + ' total', color: 'amber' },
    { label: 'Users', value: totalOf(dashboard.users), detail: 'Registered accounts', color: 'sky' },
    { label: 'Categories', value: totalOf(dashboard.categories), detail: totalOf(dashboard.brands) + ' brands', color: 'indigo' },
  ]

  const statStyles = {
    amber: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-700 ring-amber-100',
    indigo: 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white text-indigo-700 ring-indigo-100',
    sky: 'border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-700 ring-sky-100',
    teal: 'border-teal-200 bg-gradient-to-br from-teal-50 to-white text-teal-700 ring-teal-100',
  }

  const recentOrders = dashboard.orders.data.slice(0, 6)
  const recentProducts = dashboard.products.data.slice(0, 6)
  const recentUsers = dashboard.users.data.slice(0, 6)
  const lowStockProducts = dashboard.products.data
    .filter((product) => Number(product.stock ?? 0) <= 20)
    .sort((first, second) => Number(first.stock ?? 0) - Number(second.stock ?? 0))
    .slice(0, 6)

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">TosTinh admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Live overview from products, categories, brands, orders, and users APIs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-md border border-teal-800 bg-white/80 px-4 py-2 text-sm font-bold text-teal-900 shadow-sm hover:bg-teal-800 hover:text-white" to="/">
              View store
            </Link>
            <Link className="rounded-md bg-teal-800 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-900" to="/admin/products">
              Manage products
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div className={(statStyles[stat.color] ?? statStyles.teal) + ' rounded-lg border p-5 shadow-sm ring-1'} key={stat.label}>
            <p className="text-sm font-black text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{isLoading ? '...' : stat.value}</p>
            <p className="mt-3 text-sm font-black">{stat.detail}</p>
          </div>
        ))}
      </section>

      {dashboard.errors.users ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Users API needs an admin account. Login at /admin/login with an admin user to see users.
        </div>
      ) : null}


      <section className="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-amber-200 bg-amber-50/70 px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-black text-amber-950">Low-stock alerts</h2>
            <p className="mt-1 text-sm font-semibold text-amber-800">Products at 20 stock or lower need admin attention before they sell out.</p>
          </div>
          <Link className="w-fit rounded-md border border-amber-700 bg-white px-3 py-2 text-sm font-black text-amber-800 hover:bg-amber-700 hover:text-white" to="/admin/products">
            Review stock
          </Link>
        </div>
        <ScrollableTable>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockProducts.length ? lowStockProducts.map((product) => (
                <tr className="text-slate-700 transition hover:bg-amber-50/40" key={product.id ?? product.slug}>
                  <td className="px-5 py-3 font-black text-slate-950">{product.name}</td>
                  <td className="px-5 py-3 font-semibold">{product.category?.name ?? '-'}</td>
                  <td className="px-5 py-3 font-semibold">{product.brand?.name ?? '-'}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">{product.stock} left</span></td>
                  <td className="px-5 py-3">
                    <Link className="text-sm font-black text-teal-800 hover:underline" to={'/admin/products/' + product.slug + '/edit'}>Update</Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-5 py-6 text-center font-semibold text-slate-500" colSpan="5">No low-stock products right now.</td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollableTable>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionTable
          columns={[
            { key: 'order', label: 'Order', render: (row) => row.order_number },
            { key: 'status', label: 'Status', render: (row) => <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">{row.status}</span> },
            { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total_amount) },
            { key: 'date', label: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' },
          ]}
          emptyText="No orders yet."
          rows={recentOrders}
          title="Recent orders"
          accent="amber"
        />

        <SectionTable
          columns={[
            { key: 'user', label: 'User', render: (row) => row.username },
            { key: 'email', label: 'Email', render: (row) => row.email },
            { key: 'role', label: 'Role', render: (row) => row.is_admin ? 'Admin' : 'Customer' },
          ]}
          emptyText="No users loaded."
          rows={recentUsers}
          title="Recent users"
          accent="blue"
        />
      </div>

      <SectionTable
        columns={[
          { key: 'product', label: 'Product', render: (row) => row.name },
          { key: 'category', label: 'Category', render: (row) => row.category?.name ?? '-' },
          { key: 'brand', label: 'Brand', render: (row) => row.brand?.name ?? '-' },
          { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
          { key: 'stock', label: 'Stock', render: (row) => row.stock },
        ]}
        emptyText="No products loaded."
        rows={recentProducts}
        title="Catalog snapshot"
        accent="teal"
      />
    </div>
  )
}
