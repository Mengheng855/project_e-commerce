import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCategory } from '../api/categoryApi'
import { CategoryForm } from '../components/CategoryForm'

export function CategoryCreatePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(values) {
    setError('')
    setIsSaving(true)
    try {
      const category = await createCategory(values)
      navigate('/admin/categories/' + category.slug, { replace: true })
    } catch (error) {
      setError(error?.message ?? 'Could not create category.')
    } finally {
      setIsSaving(false)
    }
  }

  return <div className="grid gap-5"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Create category</p><h1 className="mt-2 text-3xl font-black text-slate-950">Add category</h1><p className="mt-2 text-sm font-medium text-slate-600">Create a new category for products.</p></div><Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/categories">Cancel</Link></div></section>{error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}<CategoryForm isLoading={isSaving} onSubmit={handleSubmit} /></div>
}
