import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminProduct, getAdminProducts } from '../api/productApi'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-'
}

function formatUser(user) {
  return user?.username ?? user?.email ?? '-'
}

function isColorVariant(variant) {
  return variant.variant_type?.name?.trim().toLowerCase() === 'color'
}

function sortSpecifications(specifications = []) {
  return [...specifications].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function ProductDetailPage() {
  const { slug } = useParams()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    let active = true

    async function loadProduct() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getAdminProduct(slug)
        if (active) setProduct(data)
      } catch (error) {
        try {
          const products = await getAdminProducts({ search: slug, per_page: 50 })
          const fallbackProduct = products.find((item) => item.slug === slug) ?? null
          if (active) {
            setProduct(fallbackProduct)
            setError(fallbackProduct ? '' : (error?.message ?? 'Product not found.'))
          }
        } catch (fallbackError) {
          if (active) {
            setProduct(null)
            setError(fallbackError?.message ?? error?.message ?? 'Product not found.')
          }
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadProduct()
    return () => { active = false }
  }, [slug])

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading product...</div>
  }

  if (!product) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 font-bold text-red-700">
        {error || 'Product not found.'}
      </div>
    )
  }

  const specifications = sortSpecifications(product.specifications)

  return (
    <div className="grid gap-5">
      <section className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Product detail</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-slate-950">{product.name}</h1>
              <span className={(product.is_active ? 'bg-teal-50 text-teal-700 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/products">Back</Link>
            <Link className="rounded-md bg-teal-800 px-4 py-2 text-sm font-bold text-white hover:bg-teal-900" to={'/admin/products/' + product.slug + '/edit'}>Update product</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {product.image ? <img alt={product.name} className="h-72 w-full rounded-md object-cover" src={assetUrl(product.image)} /> : <div className="h-72 rounded-md bg-teal-800" />}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs font-black uppercase text-slate-500">Price</dt><dd className="mt-1 font-black text-slate-950">{formatCurrency(product.price)}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Stock</dt><dd className="mt-1 font-black text-slate-950">{product.stock}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Category</dt><dd className="mt-1 font-bold text-slate-700">{product.category?.name ?? '-'}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Brand</dt><dd className="mt-1 font-bold text-slate-700">{product.brand?.name ?? '-'}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Created by</dt><dd className="mt-1 font-bold text-slate-700">{formatUser(product.created_by)}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Updated by</dt><dd className="mt-1 font-bold text-slate-700">{formatUser(product.updated_by)}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Created at</dt><dd className="mt-1 font-bold text-slate-700">{formatDate(product.created_at)}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Updated at</dt><dd className="mt-1 font-bold text-slate-700">{formatDate(product.updated_at)}</dd></div>
          </dl>
          <div className="mt-6">
            <h2 className="text-sm font-black uppercase text-slate-500">Description</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{product.description ?? '-'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Specifications</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Fixed product specs</h2>
          </div>
          <span className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-slate-700">
            {specifications.length} spec(s)
          </span>
        </div>

        {specifications.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specifications.map((specification) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={specification.id ?? specification.key}>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{specification.key}</p>
                <p className="mt-2 text-sm font-black text-slate-950">{specification.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-md border border-dashed border-slate-300 px-4 py-5 text-sm font-semibold text-slate-500">No specifications added for this product.</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Variants</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Product variants</h2>
          </div>
          <span className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-slate-700">
            {(product.variants ?? []).length} variant(s)
          </span>
        </div>

        {(product.variants ?? []).length ? (
          <div className="mt-5 max-w-full overflow-hidden rounded-lg border border-slate-200">
            <ScrollableTable>
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">No.</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Color</th>
                  <th className="px-5 py-3">Price modifier</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.variants.map((variant, index) => (
                  <tr className="text-slate-700" key={variant.id ?? index}>
                    <td className="px-5 py-3 font-black text-slate-500">{index + 1}</td>
                    <td className="px-5 py-3 font-black text-slate-950">{variant.variant_type?.name ?? '-'}</td>
                    <td className="px-5 py-3 font-semibold">{variant.value}</td>
                    <td className="px-5 py-3 font-semibold">
                      {isColorVariant(variant) && variant.color_hex ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-5 w-5 rounded border border-slate-300" style={{ backgroundColor: variant.color_hex }} />
                          {variant.color_hex}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3 font-black text-slate-950">{formatCurrency(variant.price_modifier ?? 0)}</td>
                    <td className="px-5 py-3 font-semibold">{variant.stock}</td>
                    <td className="px-5 py-3">
                      <span className={(variant.is_active ? 'bg-teal-50 text-teal-700 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>
                        {variant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </ScrollableTable>
          </div>
        ) : (
          <p className="mt-5 rounded-md border border-dashed border-slate-300 px-4 py-5 text-sm font-semibold text-slate-500">No variants added for this product.</p>
        )}
      </section>
    </div>
  )
}
