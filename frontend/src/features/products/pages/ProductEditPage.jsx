import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBrands } from '../../brands/api/brandApi'
import { getCategories } from '../../categories/api/categoryApi'
import { getProduct, getVariantTypes, updateProduct } from '../api/productApi'
import { ProductForm } from '../components/ProductForm'
import { prepareProductPayload } from '../utils/productPayload'

export function ProductEditPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [variantTypes, setVariantTypes] = useState([])
  const [product, setProduct] = useState(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [productData, categoryData, brandData, variantTypeData] = await Promise.all([
          getProduct(slug),
          getCategories({ per_page: 50 }),
          getBrands({ per_page: 50 }),
          getVariantTypes(),
        ])
        if (active) {
          setProduct(productData)
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
  }, [slug])

  async function handleSubmit(values) {
    setError('')
    setIsSaving(true)
    try {
      const payload = await prepareProductPayload(values)
      const updated = await updateProduct(slug, payload)
      navigate('/admin/products/' + updated.slug, { replace: true })
    } catch (error) {
      setError(error?.message ?? 'Could not update product.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading product...</div>
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Update product</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{product?.name ?? 'Product'}</h1>
          </div>
          <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to={'/admin/products/' + slug}>Cancel</Link>
        </div>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

      <ProductForm brands={brands} categories={categories} initialValues={product} isLoading={isSaving} onSubmit={handleSubmit} variantTypes={variantTypes} />
    </div>
  )
}
