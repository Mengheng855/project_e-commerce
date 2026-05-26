import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '../../../shared/components/Pagination'
import { getCategories } from '../../categories/api/categoryApi'
import { deleteProduct, getProducts } from '../api/productApi'
import { ProductTable } from '../components/ProductTable'

const perPage = 10
const sortOptions = [
  { label: 'Newest first', value: 'created_desc' },
  { label: 'Oldest first', value: 'created_asc' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
  { label: 'Price low-high', value: 'price_asc' },
  { label: 'Price high-low', value: 'price_desc' },
  { label: 'Stock low-high', value: 'stock_asc' },
  { label: 'Stock high-low', value: 'stock_desc' },
  { label: 'Recently updated', value: 'updated_desc' },
]

function sortProducts(products, sortBy) {
  const sortedProducts = [...products]

  return sortedProducts.sort((firstProduct, secondProduct) => {
    if (sortBy === 'name_asc') return firstProduct.name.localeCompare(secondProduct.name)
    if (sortBy === 'name_desc') return secondProduct.name.localeCompare(firstProduct.name)
    if (sortBy === 'price_asc') return Number(firstProduct.price) - Number(secondProduct.price)
    if (sortBy === 'price_desc') return Number(secondProduct.price) - Number(firstProduct.price)
    if (sortBy === 'stock_asc') return Number(firstProduct.stock) - Number(secondProduct.stock)
    if (sortBy === 'stock_desc') return Number(secondProduct.stock) - Number(firstProduct.stock)
    if (sortBy === 'created_asc') return new Date(firstProduct.created_at ?? 0) - new Date(secondProduct.created_at ?? 0)
    if (sortBy === 'updated_desc') return new Date(secondProduct.updated_at ?? 0) - new Date(firstProduct.updated_at ?? 0)

    return new Date(secondProduct.created_at ?? 0) - new Date(firstProduct.created_at ?? 0)
  })
}

export function ProductListPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [sortBy, setSortBy] = useState('created_desc')

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const [productData, categoryData] = await Promise.all([
          getProducts({ per_page: 50 }),
          getCategories({ per_page: 50 }),
        ])
        if (active) {
          setProducts(productData)
          setCategories(categoryData)
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
      const matchesCategory = activeCategory === 'All' || product.category?.id === activeCategory
      const matchesSearch = !normalizedSearch || [product.name, product.description, product.brand?.name, product.category?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
      return matchesCategory && matchesSearch
    })

    return sortProducts(filteredItems, sortBy)
  }, [activeCategory, products, search, sortBy])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds([])
  }, [activeCategory, search, sortBy])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredProducts.slice(start, start + perPage)
  }, [currentPage, filteredProducts])

  function handleSelectOne(productId, checked) {
    setSelectedIds((currentIds) => checked
      ? [...new Set([...currentIds, productId])]
      : currentIds.filter((id) => id !== productId))
  }

  function handleSelectAll(checked, visibleProducts) {
    const visibleIds = visibleProducts.map((product) => product.id)
    setSelectedIds((currentIds) => checked
      ? [...new Set([...currentIds, ...visibleIds])]
      : currentIds.filter((id) => !visibleIds.includes(id)))
  }

  async function handleDelete(targetProducts) {
    if (!targetProducts.length) {
      return
    }

    const ok = window.confirm('Delete ' + targetProducts.length + ' product(s)?')
    if (!ok) {
      return
    }

    setIsDeleting(true)

    try {
      await Promise.all(targetProducts.map((product) => deleteProduct(product.slug)))
      const deletedIds = targetProducts.map((product) => product.id)
      setProducts((currentProducts) => currentProducts.filter((product) => !deletedIds.includes(product.id)))
      setSelectedIds((currentIds) => currentIds.filter((id) => !deletedIds.includes(id)))
    } finally {
      setIsDeleting(false)
    }
  }

  const outOfStockProducts = useMemo(() => {
    return products.filter((product) => Number(product.stock) <= 0)
  }, [products])

  const selectedProducts = products.filter((product) => selectedIds.includes(product.id))

  return (
    <div className="grid max-w-full gap-5 overflow-hidden">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Catalog</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Products</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-md border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">
              {isLoading ? 'Loading...' : filteredProducts.length + ' products'}
            </div>
            <Link className="rounded-md bg-teal-800 px-4 py-3 text-sm font-black text-white hover:bg-teal-900" to="/admin/products/create">
              Add product
            </Link>
          </div>
        </div>
      </section>

      {outOfStockProducts.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-red-700">Out of stock alert</p>
              <p className="mt-1 text-sm font-bold text-red-800">{outOfStockProducts.length} product(s) have no stock left.</p>
            </div>
            <div className="flex max-w-full flex-wrap gap-2">
              {outOfStockProducts.slice(0, 5).map((product) => (
                <Link className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100" key={product.id ?? product.slug} to={'/admin/products/' + product.slug}>
                  {product.name}: {product.stock}
                </Link>
              ))}
              {outOfStockProducts.length > 5 ? <span className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700">+{outOfStockProducts.length - 5} more</span> : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid max-w-full gap-3 overflow-hidden xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
        <input
          className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product, brand, category"
          type="search"
          value={search}
        />
        <select
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
          onChange={(event) => setSortBy(event.target.value)}
          value={sortBy}
        >
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <div className="flex max-w-full flex-wrap gap-2">
          {[{ id: 'All', name: 'All' }, ...categories].map((category) => (
            <button
              className={(activeCategory === category.id ? 'bg-teal-800 text-white ' : 'bg-white text-teal-900 ') + 'rounded-md border border-teal-800 px-3 py-2 text-sm font-black'}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-600">{selectedIds.length} selected</p>
        <button
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedProducts.length || isDeleting}
          onClick={() => handleDelete(selectedProducts)}
          type="button"
        >
          {isDeleting ? 'Deleting...' : 'Delete selected'}
        </button>
      </section>

      <ProductTable
        isDeleting={isDeleting}
        isLoading={isLoading}
        onDelete={handleDelete}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        products={paginatedProducts}
        selectedIds={selectedIds}
        startIndex={(currentPage - 1) * perPage}
      />

      <Pagination currentPage={currentPage} onPageChange={setCurrentPage} perPage={perPage} total={filteredProducts.length} />
    </div>
  )
}
