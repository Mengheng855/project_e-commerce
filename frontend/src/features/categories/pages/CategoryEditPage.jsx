import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategory, updateCategory } from '../api/categoryApi'
import { CategoryForm } from '../components/CategoryForm'

export function CategoryEditPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function loadCategory() {
      try { const data = await getCategory(slug); if (active) setCategory(data) }
      finally { if (active) setIsLoading(false) }
    }
    loadCategory()
    return () => { active = false }
  }, [slug])

  async function handleSubmit(values) {
    setError('')
    setIsSaving(true)
    try { const updated = await updateCategory(slug, values); navigate('/admin/categories/' + updated.slug, { replace: true }) }
    catch (error) { setError(error?.message ?? 'Could not update category.') }
    finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading category...</div>

  return <div className="grid gap-5"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Update category</p><h1 className="mt-2 text-3xl font-black text-slate-950">{category?.name ?? 'Category'}</h1></div><Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to={'/admin/categories/' + slug}>Cancel</Link></div></section>{error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}<CategoryForm initialValues={category} isLoading={isSaving} onSubmit={handleSubmit} /></div>
}
