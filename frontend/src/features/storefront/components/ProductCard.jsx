import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { getProduct } from '../../products/api/productApi'
import { ProductVisual } from './ProductVisual'

export function ProductCard({ product }) {
  const [detailProduct, setDetailProduct] = useState(null)
  const hasRequestedDetail = useRef(false)
  const visualProduct = detailProduct ?? product

  async function prefetchProductDetail() {
    if (hasRequestedDetail.current || product.images?.length || !product.slug) {
      return
    }

    hasRequestedDetail.current = true

    try {
      setDetailProduct(await getProduct(product.slug))
    } catch {
      setDetailProduct(null)
    }
  }

  return (
    <Link
      className="group rounded-lg border border-teal-900/15 bg-white p-3 text-left transition hover:border-teal-800 hover:shadow-lg"
      onFocus={prefetchProductDetail}
      onMouseEnter={prefetchProductDetail}
      to={'/products/' + product.slug}
    >
      <ProductVisual hoverSwap product={visualProduct} />
      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-black text-teal-950 group-hover:text-teal-800">{product.name}</h3>
          <span className="rounded-md bg-teal-800 px-2 py-1 text-xs font-bold text-white">
            {product.category?.name ?? 'Tech'}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium text-teal-900/75">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black text-teal-950">{formatCurrency(product.price)}</p>
            {product.original_price ? (
              <p className="text-sm font-semibold text-teal-900/60 line-through">{formatCurrency(product.original_price)}</p>
            ) : null}
          </div>
          <p className="text-sm font-bold text-teal-900">Stock {product.stock}</p>
        </div>
      </div>
    </Link>
  )
}
