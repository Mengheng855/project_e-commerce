import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBrands } from '../../brands/api/brandApi'
import { getCategories } from '../../categories/api/categoryApi'
import { getProducts } from '../../products/api/productApi'
import { ProductCard } from '../components/ProductCard'
import { Seo } from '../../../shared/seo/Seo'
import { seoConfig } from '../../../shared/seo/config'

const productsPerPage = 8


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

function ProductGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: productsPerPage }).map((_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  )
}

function FilterSkeleton() {
  return (
    <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_190px_260px_190px] xl:items-start">
      <div className="h-11 skeleton-shimmer rounded-md" />
      <div className="h-11 skeleton-shimmer rounded-md" />
      <div className="h-11 skeleton-shimmer rounded-md" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-11 skeleton-shimmer rounded-md" />
        <div className="h-11 skeleton-shimmer rounded-md" />
      </div>
      <div className="h-11 skeleton-shimmer rounded-md" />
    </div>
  )
}

const sortOptions = [
  { label: 'Newest first', value: 'created_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
  { label: 'Price low-high', value: 'price_asc' },
  { label: 'Price high-low', value: 'price_desc' },
  { label: 'Stock low-high', value: 'stock_asc' },
  { label: 'Stock high-low', value: 'stock_desc' },
]

function matchesPriceRange(product, minPrice, maxPrice) {
  const price = Number(product.price)
  const min = minPrice === '' ? null : Number(minPrice)
  const max = maxPrice === '' ? null : Number(maxPrice)

  if (min !== null && price < min) return false
  if (max !== null && price > max) return false

  return true
}

function sortProducts(products, sortBy) {
  const sortedProducts = [...products]

  return sortedProducts.sort((firstProduct, secondProduct) => {
    if (sortBy === 'name_asc') return firstProduct.name.localeCompare(secondProduct.name)
    if (sortBy === 'name_desc') return secondProduct.name.localeCompare(firstProduct.name)
    if (sortBy === 'price_asc') return Number(firstProduct.price) - Number(secondProduct.price)
    if (sortBy === 'price_desc') return Number(secondProduct.price) - Number(firstProduct.price)
    if (sortBy === 'stock_asc') return Number(firstProduct.stock) - Number(secondProduct.stock)
    if (sortBy === 'stock_desc') return Number(secondProduct.stock) - Number(firstProduct.stock)

    return new Date(secondProduct.created_at ?? 0) - new Date(firstProduct.created_at ?? 0)
  })
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeBrand, setActiveBrand] = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [maxPrice, setMaxPrice] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')
  const categoryParam = searchParams.get('category')

  useEffect(() => {
    setActiveCategory(categoryParam || 'All')
  }, [categoryParam])

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const [apiProducts, categoryData, brandData] = await Promise.all([
          getProducts({ per_page: 50 }),
          getCategories({ has_products: true, per_page: 50 }),
          getBrands({ per_page: 50 }),
        ])
        if (active) {
          setProducts(apiProducts)
          setCategories(categoryData)
          setBrands(brandData)
        }
      } catch {
        if (active) {
          setProducts([])
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filteredItems = products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category?.slug === activeCategory
      const matchesBrand = activeBrand === 'All' || product.brand?.id === activeBrand
      const matchesSearch = !normalizedSearch || [product.name, product.description, product.brand?.name, product.category?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
      const matchesSelectedPrice = matchesPriceRange(product, minPrice, maxPrice)

      return matchesCategory && matchesBrand && matchesSearch && matchesSelectedPrice
    })

    return sortProducts(filteredItems, sortBy)
  }, [activeBrand, activeCategory, maxPrice, minPrice, products, search, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeBrand, activeCategory, maxPrice, minPrice, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * productsPerPage
  const paginatedProducts = filteredProducts.slice(pageStart, pageStart + productsPerPage)

  return (
    <>
      <Seo
        canonical="/products"
        description="Browse TosTinh and Tos Tinh electronics including computers, phones, accessories, keyboards, monitors, and daily tech essentials in Cambodia."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'TosTinh / Tos Tinh products',
          alternateName: ['Tos Tinh computer products', 'TosTinh electronics catalog'],
          url: seoConfig.siteUrl + '/products',
          description: 'Browse TosTinh and Tos Tinh electronics including computers, phones, accessories, keyboards, monitors, and daily tech essentials in Cambodia.',
        }}
        title="Shop Tos Tinh Electronics"
      />
      <section className="border-b border-teal-900/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-sm font-black uppercase tracking-wide text-teal-800">Shop catalog</p>
          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-teal-950 md:text-5xl">All products</h1>
            </div>
            <div className="rounded-md border border-teal-900/15 px-4 py-3 text-sm font-black text-teal-900">
              {isLoading ? (
                <span className="block h-4 w-24 skeleton-shimmer rounded" />
              ) : filteredProducts.length + ' products'}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        {isLoading ? <FilterSkeleton /> : (
        <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_190px_260px_190px] xl:items-start">
          <input
            className="h-11 rounded-md border border-teal-900/20 px-4 text-sm font-semibold text-teal-950 outline-none placeholder:text-teal-900/40 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, brands, categories"
            type="search"
            value={search}
          />
          <select
            aria-label="Filter by category"
            className="h-11 rounded-md border border-teal-900/20 bg-white px-3 text-sm font-black text-teal-950 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
            onChange={(event) => {
              const value = event.target.value
              if (value === 'All') {
                setSearchParams({})
              } else {
                setSearchParams({ category: value })
              }
            }}
            value={activeCategory}
          >
            <option value="All">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
          <select
            aria-label="Filter by brand"
            className="h-11 rounded-md border border-teal-900/20 bg-white px-3 text-sm font-black text-teal-950 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
            onChange={(event) => setActiveBrand(event.target.value === 'All' ? 'All' : Number(event.target.value))}
            value={activeBrand}
          >
            <option value="All">All brands</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              aria-label="Minimum price"
              className="h-11 min-w-0 rounded-md border border-teal-900/20 px-3 text-sm font-black text-teal-950 outline-none placeholder:text-teal-900/40 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
              min="0"
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min price"
              step="0.01"
              type="number"
              value={minPrice}
            />
            <input
              aria-label="Maximum price"
              className="h-11 min-w-0 rounded-md border border-teal-900/20 px-3 text-sm font-black text-teal-950 outline-none placeholder:text-teal-900/40 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
              min="0"
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max price"
              step="0.01"
              type="number"
              value={maxPrice}
            />
          </div>
          <select
            aria-label="Sort products"
            className="h-11 rounded-md border border-teal-900/20 bg-white px-3 text-sm font-black text-teal-950 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
            onChange={(event) => setSortBy(event.target.value)}
            value={sortBy}
          >
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        )}

        {isLoading ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id ?? product.slug} product={product} />
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 rounded-lg border border-teal-900/15 bg-white px-4 py-3 text-sm font-black text-teal-900 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {pageStart + 1}-{Math.min(pageStart + productsPerPage, filteredProducts.length)} of {filteredProducts.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-teal-900/20 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  Previous
                </button>
                <span className="skeleton-shimmer rounded-md px-3 py-2">{safeCurrentPage} / {totalPages}</span>
                <button
                  className="rounded-md border border-teal-900/20 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-teal-900/15 bg-white p-8 text-center">
            <h2 className="text-2xl font-black text-teal-950">No products found</h2>
            <p className="mt-2 text-sm font-semibold text-teal-900/70">Try a different search, category, brand, price, or sort option.</p>
          </div>
        )}
      </section>
    </>
  )
}
