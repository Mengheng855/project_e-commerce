import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../../products/api/productApi'
import { getCategories } from '../../categories/api/categoryApi'
import { getBanners } from '../api/bannerApi'
import { sampleBanners } from '../data/sampleBanners'
import { ProductCard } from '../components/ProductCard'
import { assetUrl } from '../../../shared/utils/assetUrl'




function isFeaturedProduct(product) {
  return product.is_featured === true || product.is_featured === 1 || product.is_featured === '1'
}

function formatHeroTitle(categoryNames) {
  const names = categoryNames.filter(Boolean).slice(0, 3)

  if (names.length === 1) {
    return names[0] + ' essentials for your daily setup.'
  }

  if (names.length === 2) {
    return names[0] + ' and ' + names[1] + ' essentials.'
  }

  if (names.length >= 3) {
    return names[0] + ', ' + names[1] + ', and ' + names[2] + ' essentials.'
  }

  return 'Clean tech essentials for every setup.'
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="h-44 skeleton-shimmer rounded-md" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="h-5 w-2/3 skeleton-shimmer rounded" />
        <div className="h-7 w-20 skeleton-shimmer rounded-md" />
      </div>
      <div className="mt-3 h-4 w-full skeleton-shimmer rounded" />
      <div className="mt-2 h-4 w-4/5 skeleton-shimmer rounded" />
      <div className="mt-5 flex items-end justify-between">
        <div className="grid gap-2">
          <div className="h-5 w-24 skeleton-shimmer rounded" />
          <div className="h-4 w-16 skeleton-shimmer rounded" />
        </div>
        <div className="h-4 w-20 skeleton-shimmer rounded" />
      </div>
    </div>
  )
}

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  )
}

export function StoreHomePage() {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState(sampleBanners)
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadHomeData() {
      try {
        const [apiProducts, apiBanners, apiCategories] = await Promise.all([
          getProducts({ per_page: 50 }),
          getBanners(),
          getCategories({ has_products: true, per_page: 50 }),
        ])
        const nextBanners = apiBanners.length ? apiBanners : sampleBanners

        if (active) {
          setProducts(apiProducts)
          setBanners(nextBanners)
          setCategories(apiCategories.filter((category) => category.is_active !== false))
        }
      } catch {
        if (active) {
          setProducts([])
          setBanners(sampleBanners)
          setCategories([])
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      active = false
    }
  }, [])

  const featuredProducts = useMemo(() => {
    return products.filter(isFeaturedProduct)
  }, [products])

  const featuredProduct = featuredProducts[0]
  const activeBanner = banners[0] ?? sampleBanners[0]
  const categoryOptions = useMemo(() => {
    const apiCategoryNames = categories.map((category) => category.name).filter(Boolean)
    const productCategoryNames = products.map((product) => product.category?.name).filter(Boolean)
    return [...new Set(apiCategoryNames.length ? apiCategoryNames : productCategoryNames)]
  }, [categories, products])
  const heroTitle = activeBanner.title || formatHeroTitle(categoryOptions)

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') {
      return featuredProducts
    }

    return featuredProducts.filter((product) => product.category?.name === activeCategory)
  }, [activeCategory, featuredProducts])

  return (
    <>
      <section className="relative overflow-hidden border-b border-teal-900/15 bg-white" id="top">
        <img alt="Electronics banner" className="absolute inset-0 h-full w-full object-cover" src={assetUrl(activeBanner.image)} />
        <div className="absolute inset-0 bg-white/35" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-800">Electronics store</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-teal-950 md:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-teal-950">
              {activeBanner.text ?? 'Shop practical electronics with a focused catalog, clear prices, and dedicated product detail pages.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="rounded-md bg-teal-800 px-5 py-3 text-sm font-black text-white hover:bg-teal-900" href="/products">
                Browse products
              </a>
              {featuredProduct ? (
                <a className="rounded-md border border-teal-800 bg-white/80 px-5 py-3 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white" href={'/products/' + featuredProduct.slug}>
                  View featured
                </a>
              ) : null}
            </div>
          </div>
          <div className="overflow-hidden">
            <img alt="Store banner" className="h-64 w-full object-cover" src={assetUrl(activeBanner.foreground_image ?? activeBanner.image)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10" id="products">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black text-teal-950">Featured products</h2>
            <p className="mt-2 text-sm font-medium text-teal-900/75">
              {isLoading ? (
                <span className="block h-4 w-72 max-w-full skeleton-shimmer rounded" />
              ) : 'Only products marked as featured are shown here.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...categoryOptions].map((category) => (
              <button
                className={(activeCategory === category ? 'bg-teal-800 text-white ' : 'bg-white text-teal-900 ') + 'rounded-md border border-teal-800 px-3 py-2 text-sm font-black'}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id ?? product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
