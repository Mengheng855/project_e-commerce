import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBrands } from '../../brands/api/brandApi'
import { getCategories } from '../../categories/api/categoryApi'
import { createProduct, getVariantTypes } from '../api/productApi'
import { ProductForm } from '../components/ProductForm'
import { prepareProductPayload } from '../utils/productPayload'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [variantTypes, setVariantTypes] = useState([])

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [categoryData, brandData, variantTypeData] = await Promise.all([
          getCategories({ per_page: 50 }),
          getBrands({ per_page: 50 }),
          getVariantTypes(),
        ])
        if (active) {
          setCategories(categoryData)
          setBrands(brandData)
          setVariantTypes(variantTypeData)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadData()
    return () => { active = false }
  }, [])

  async function handleSubmit(values) {
    setError('')
    setIsSaving(true)
    try {
      const payload = await prepareProductPayload(values)
      const product = await createProduct(payload)
      navigate('/admin/products/' + product.slug, { replace: true })
    } catch (error) {
      setError(error?.message ?? 'Could not create product.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Create product</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Add product</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">Create a new catalog product for the storefront.</p>
          </div>
          <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/products">Cancel</Link>
        </div>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      {isLoading ? <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading form...</div> : (
        <ProductForm brands={brands} categories={categories} isLoading={isSaving} onSubmit={handleSubmit} variantTypes={variantTypes} />
      )}
    </div>
  )
}
