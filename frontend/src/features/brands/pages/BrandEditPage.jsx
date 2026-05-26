import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBrand, updateBrand } from '../api/brandApi'
import { BrandForm } from '../components/BrandForm'

export function BrandEditPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [brand, setBrand] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { let active = true; async function loadBrand() { try { const data = await getBrand(slug); if (active) setBrand(data) } finally { if (active) setIsLoading(false) } } loadBrand(); return () => { active = false } }, [slug])

  async function handleSubmit(values) {
    setError('')
    setIsSaving(true)
    try { const updated = await updateBrand(slug, values); navigate('/admin/brands/' + updated.slug, { replace: true }) }
    catch (error) { setError(error?.message ?? 'Could not update brand.') }
    finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading brand...</div>

  return <div className="grid gap-5"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Update brand</p><h1 className="mt-2 text-3xl font-black text-slate-950">{brand?.name ?? 'Brand'}</h1></div><Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to={'/admin/brands/' + slug}>Cancel</Link></div></section>{error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}<BrandForm initialValues={brand} isLoading={isSaving} onSubmit={handleSubmit} /></div>
}
