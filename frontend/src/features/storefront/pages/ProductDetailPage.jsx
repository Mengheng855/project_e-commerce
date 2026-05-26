import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../../products/api/productApi'
import { ProductDetail } from '../components/ProductDetail'


function ProductDetailSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="h-5 w-32 skeleton-shimmer skeleton-shimmer rounded" />
      <div className="mt-5 grid gap-6 rounded-lg border border-teal-900/15 bg-white p-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="aspect-[4/3] skeleton-shimmer rounded-lg" />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => <div className="h-16 skeleton-shimmer rounded-md" key={index} />)}
          </div>
        </div>
        <div className="grid content-start gap-5">
          <div className="h-4 w-20 skeleton-shimmer rounded" />
          <div className="h-10 w-3/4 skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-2/3 skeleton-shimmer rounded" />
          <div className="h-9 w-36 skeleton-shimmer rounded" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 skeleton-shimmer rounded-md" />
            <div className="h-20 skeleton-shimmer rounded-md" />
            <div className="h-20 skeleton-shimmer rounded-md" />
          </div>
          <div className="h-11 w-32 skeleton-shimmer rounded-md" />
        </div>
      </div>
    </section>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProduct() {
      try {
        const apiProduct = await getProduct(slug)

        if (active) {
          setProduct(apiProduct)
        }
      } catch {
        if (active) {
          setProduct(null)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      active = false
    }
  }, [slug])

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-12">
        <h1 className="text-3xl font-black text-teal-950">Product not found</h1>
        <Link className="mt-5 inline-flex rounded-md bg-teal-800 px-4 py-2 text-sm font-black text-white" to="/">
          Back to products
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <Link className="text-sm font-black text-teal-800 hover:text-teal-950" to="/">
        Back to products
      </Link>
      <div className="mt-5">
        <ProductDetail product={product} />
      </div>
    </section>
  )
}
