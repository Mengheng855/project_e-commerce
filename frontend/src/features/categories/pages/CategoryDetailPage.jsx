import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteCategory, getCategory } from '../api/categoryApi'

function formatDate(value) { return value ? new Date(value).toLocaleString() : '-' }
function formatUser(user) { return user?.username ?? user?.email ?? '-' }

export function CategoryDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { let active = true; async function loadCategory() { try { const data = await getCategory(slug); if (active) setCategory(data) } finally { if (active) setIsLoading(false) } } loadCategory(); return () => { active = false } }, [slug])

  async function handleDelete() {
    if (!category || !window.confirm('Delete category ' + category.name + '?')) return
    setIsDeleting(true)
    try { await deleteCategory(category.slug); navigate('/admin/categories', { replace: true }) }
    finally { setIsDeleting(false) }
  }

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading category...</div>
  if (!category) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Category not found.</div>

  return <div className="grid gap-5"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Category detail</p><h1 className="mt-2 text-3xl font-black text-slate-950">{category.name}</h1></div><div className="flex flex-wrap gap-3"><Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/categories">Back</Link><Link className="rounded-md bg-teal-800 px-4 py-2 text-sm font-bold text-white hover:bg-teal-900" to={'/admin/categories/' + category.slug + '/edit'}>Edit</Link><button className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50" disabled={isDeleting} onClick={handleDelete} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button></div></div></section><section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"><div><p className="text-xs font-black uppercase text-slate-500">Description</p><p className="mt-1 font-semibold text-slate-800">{category.description ?? '-'}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Products</p><p className="mt-1 font-semibold text-slate-800">{category.products_count ?? 0}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Status</p><p className="mt-1 font-semibold text-slate-800">{category.is_active ? 'Active' : 'Inactive'}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Created by</p><p className="mt-1 font-semibold text-slate-800">{formatUser(category.created_by)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Created at</p><p className="mt-1 font-semibold text-slate-800">{formatDate(category.created_at)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Updated by</p><p className="mt-1 font-semibold text-slate-800">{formatUser(category.updated_by)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Updated at</p><p className="mt-1 font-semibold text-slate-800">{formatDate(category.updated_at)}</p></div></section></div>
}
