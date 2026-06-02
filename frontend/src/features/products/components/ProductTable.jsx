import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

function imageKey(image) {
  return String(image?.id ?? image?.image ?? image ?? '')
}

function ProductThumbnail({ product }) {
  const [failedImageKeys, setFailedImageKeys] = useState([])
  const failedImageSet = new Set(failedImageKeys)
  const imageCandidates = useMemo(() => {
    const galleryImages = Array.isArray(product.images) ? product.images : []
    const mainImage = product.image ? [{ image: product.image, alt_text: product.name }] : []
    const primaryImages = galleryImages.filter((image) => image.is_primary)
    const secondaryImages = galleryImages.filter((image) => !image.is_primary)

    return [...primaryImages, ...mainImage, ...secondaryImages]
  }, [product])
  const selectedImage = imageCandidates.find((image) => !failedImageSet.has(imageKey(image))) ?? null
  const src = assetUrl(selectedImage?.image)

  if (!src) {
    return <div className="flex h-12 w-14 items-center justify-center rounded-md bg-teal-800 text-xs font-black text-white">TT</div>
  }

  return (
    <img
      alt={selectedImage?.alt_text ?? product.name}
      className="h-12 w-14 rounded-md border border-slate-200 bg-slate-100 object-cover"
      onError={() => setFailedImageKeys((currentKeys) => [...new Set([...currentKeys, imageKey(selectedImage)])])}
      src={src}
    />
  )
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleDateString()
}

function formatUser(user) {
  return user?.username ?? user?.email ?? '-'
}

function StockValue({ stock }) {
  const stockNumber = Number(stock)

  if (stockNumber <= 0) {
    return <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-black text-red-700">Out: {stockNumber}</span>
  }

  if (stockNumber <= 20) {
    return <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">Low stock: {stockNumber}</span>
  }

  return <span>{stockNumber}</span>
}

function FeaturedValue({ product }) {
  const isFeatured = product.is_featured === true || product.is_featured === 1 || product.is_featured === '1'

  return (
    <span className={(isFeatured ? 'bg-amber-100 text-amber-800 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>
      {isFeatured ? 'Featured' : 'No'}
    </span>
  )
}

function IconButton({ children, label, tone = 'slate', ...props }) {
  const toneClass = tone === 'red'
    ? 'text-red-600 hover:border-red-600 hover:bg-red-50 hover:text-red-700'
    : tone === 'teal'
      ? 'text-teal-700 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-800'
      : 'text-slate-700 hover:border-slate-500 hover:bg-slate-50 hover:text-slate-950'

  return (
    <button
      aria-label={label}
      className={'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white disabled:cursor-not-allowed disabled:opacity-50 ' + toneClass}
      title={label}
      {...props}
    >
      {children}
    </button>
  )
}

function ViewIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
}

function EditIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
}

function TrashIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>
}

export function ProductTable({ isDeleting = false, isLoading = false, onDelete, onSelectAll, onSelectOne, products = [], selectedIds = [], startIndex = 0 }) {
  const selectedSet = new Set(selectedIds)
  const allVisibleSelected = products.length > 0 && products.every((product) => selectedSet.has(product.id))

  return (
    <section className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <ScrollableTable>
        <table className="w-full min-w-[1460px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">
                <input checked={allVisibleSelected} disabled={!products.length || isDeleting} onChange={(event) => onSelectAll(event.target.checked, products)} type="checkbox" />
              </th>
              <th className="px-5 py-3">No.</th>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Brand</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Created by</th>
              <th className="px-5 py-3">Created at</th>
              <th className="px-5 py-3">Updated by</th>
              <th className="px-5 py-3">Updated at</th>
              <th className="px-5 py-3">Featured</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="14">Loading products...</td>
              </tr>
            ) : products.length ? products.map((product, index) => (
              <tr className="text-slate-700" key={product.id ?? product.slug}>
                <td className="px-5 py-3">
                  <input checked={selectedSet.has(product.id)} disabled={isDeleting} onChange={(event) => onSelectOne(product.id, event.target.checked)} type="checkbox" />
                </td>
                <td className="px-5 py-3 font-black text-slate-500">{startIndex + index + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ProductThumbnail product={product} />
                    <div>
                      <p className="font-black text-slate-950">{product.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-semibold">{product.category?.name ?? '-'}</td>
                <td className="px-5 py-3 font-semibold">{product.brand?.name ?? '-'}</td>
                <td className="px-5 py-3 font-black text-slate-950">{formatCurrency(product.price)}</td>
                <td className="px-5 py-3 font-semibold"><StockValue stock={product.stock} /></td>
                <td className="px-5 py-3 font-semibold">{formatUser(product.created_by)}</td>
                <td className="px-5 py-3 font-semibold">{formatDate(product.created_at)}</td>
                <td className="px-5 py-3 font-semibold">{formatUser(product.updated_by)}</td>
                <td className="px-5 py-3 font-semibold">{formatDate(product.updated_at)}</td>
                <td className="px-5 py-3"><FeaturedValue product={product} /></td>
                <td className="px-5 py-3">
                  <span className={(product.is_active ? 'bg-teal-50 text-teal-700 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link aria-label="View product" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-teal-700 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-800" title="View product" to={'/admin/products/' + product.slug}>
                      <ViewIcon />
                    </Link>
                    <Link aria-label="Update product" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50 hover:text-slate-950" title="Update product" to={'/admin/products/' + product.slug + '/edit'}>
                      <EditIcon />
                    </Link>
                    <IconButton disabled={isDeleting} label="Delete product" onClick={() => onDelete([product])} tone="red" type="button">
                      <TrashIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="14">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollableTable>
    </section>
  )
}
