import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '../../../shared/components/Pagination'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { deleteBrand, getBrands } from '../api/brandApi'

const perPage = 10
const filters = ['All', 'Active', 'Inactive']

function ViewIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
}
function EditIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
}
function TrashIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>
}
function formatDate(value) { return value ? new Date(value).toLocaleDateString() : '-' }
function formatUser(user) { return user?.username ?? user?.email ?? '-' }
function updateSelection(currentIds, itemId, checked) { return checked ? [...new Set([...currentIds, itemId])] : currentIds.filter((id) => id !== itemId) }


export function BrandListPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [brands, setBrands] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => { let active = true; async function loadBrands() { try { const data = await getBrands({ per_page: 50 }); if (active) setBrands(data) } finally { if (active) setIsLoading(false) } } loadBrands(); return () => { active = false } }, [])

  const filteredBrands = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return brands.filter((brand) => {
      const matchesStatus = activeFilter === 'All' || Boolean(brand.is_active) === (activeFilter === 'Active')
      const matchesSearch = !normalizedSearch || [brand.name, brand.description, brand.website, brand.created_by?.username, brand.updated_by?.username].filter(Boolean).some((value) => value.toLowerCase().includes(normalizedSearch))
      return matchesStatus && matchesSearch
    })
  }, [activeFilter, brands, search])

  useEffect(() => { setCurrentPage(1); setSelectedIds([]) }, [activeFilter, search])
  const paginatedBrands = useMemo(() => filteredBrands.slice((currentPage - 1) * perPage, currentPage * perPage), [currentPage, filteredBrands])
  const selectedBrands = brands.filter((brand) => selectedIds.includes(brand.id))
  const selectedSet = new Set(selectedIds)
  const allVisibleSelected = paginatedBrands.length > 0 && paginatedBrands.every((brand) => selectedSet.has(brand.id))

  function handleSelectAll(checked) {
    const visibleIds = paginatedBrands.map((brand) => brand.id)
    setSelectedIds((currentIds) => checked ? [...new Set([...currentIds, ...visibleIds])] : currentIds.filter((id) => !visibleIds.includes(id)))
  }

  async function handleDelete(targetBrands) {
    if (!targetBrands.length) return
    const ok = window.confirm('Delete ' + targetBrands.length + ' brand(s)?')
    if (!ok) return
    setIsDeleting(true)
    try {
      await Promise.all(targetBrands.map((brand) => deleteBrand(brand.slug)))
      const deletedIds = targetBrands.map((brand) => brand.id)
      setBrands((currentBrands) => currentBrands.filter((brand) => !deletedIds.includes(brand.id)))
      setSelectedIds((currentIds) => currentIds.filter((id) => !deletedIds.includes(id)))
    } finally { setIsDeleting(false) }
  }

  return (
    <div className="grid max-w-full gap-5 overflow-hidden">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Catalog</p><h1 className="mt-2 text-3xl font-black text-slate-950">Brands</h1></div><div className="flex flex-wrap gap-3"><div className="rounded-md border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">{isLoading ? 'Loading...' : filteredBrands.length + ' brands'}</div><Link className="rounded-md bg-teal-800 px-4 py-3 text-sm font-black text-white hover:bg-teal-900" to="/admin/brands/create">Add brand</Link></div></div></section>
      <section className="grid max-w-full gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><input className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" onChange={(event) => setSearch(event.target.value)} placeholder="Search brand, website, creator" type="search" value={search} /><div className="flex max-w-full flex-wrap gap-2">{filters.map((filter) => <button className={(activeFilter === filter ? 'bg-teal-800 text-white ' : 'bg-white text-teal-900 ') + 'rounded-md border border-teal-800 px-3 py-2 text-sm font-black'} key={filter} onClick={() => setActiveFilter(filter)} type="button">{filter}</button>)}</div></section>
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-bold text-slate-600">{selectedIds.length} selected</p><button className="rounded-md bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedBrands.length || isDeleting} onClick={() => handleDelete(selectedBrands)} type="button">{isDeleting ? 'Deleting...' : 'Delete selected'}</button></section>
      <section className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><ScrollableTable><table className="w-full min-w-[1380px] text-left text-sm"><thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3"><input checked={allVisibleSelected} disabled={!paginatedBrands.length || isDeleting} onChange={(event) => handleSelectAll(event.target.checked)} type="checkbox" /></th><th className="px-5 py-3">No.</th><th className="px-5 py-3">Brand</th><th className="px-5 py-3">Website</th><th className="px-5 py-3">Products</th><th className="px-5 py-3">Created by</th><th className="px-5 py-3">Created at</th><th className="px-5 py-3">Updated by</th><th className="px-5 py-3">Updated at</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{isLoading ? <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="11">Loading brands...</td></tr> : paginatedBrands.length ? paginatedBrands.map((brand, index) => (<tr className="text-slate-700" key={brand.id ?? brand.slug}><td className="px-5 py-3"><input checked={selectedSet.has(brand.id)} disabled={isDeleting} onChange={(event) => setSelectedIds((ids) => updateSelection(ids, brand.id, event.target.checked))} type="checkbox" /></td><td className="px-5 py-3 font-black text-slate-500">{(currentPage - 1) * perPage + index + 1}</td><td className="px-5 py-3"><div className="flex items-center gap-3">{brand.logo ? <img alt={brand.name} className="h-10 w-10 rounded-md object-cover" src={brand.logo} /> : <div className="h-10 w-10 rounded-md bg-teal-800" />}<span className="font-black text-slate-950">{brand.name}</span></div></td><td className="px-5 py-3 font-semibold">{brand.website ?? '-'}</td><td className="px-5 py-3 font-black text-slate-950">{brand.products_count ?? 0}</td><td className="px-5 py-3 font-semibold">{formatUser(brand.created_by)}</td><td className="px-5 py-3 font-semibold">{formatDate(brand.created_at)}</td><td className="px-5 py-3 font-semibold">{formatUser(brand.updated_by)}</td><td className="px-5 py-3 font-semibold">{formatDate(brand.updated_at)}</td><td className="px-5 py-3"><span className={(brand.is_active ? 'bg-teal-50 text-teal-700 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>{brand.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-5 py-3"><div className="flex items-center gap-2"><Link aria-label="View brand" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-teal-700 hover:border-teal-700 hover:bg-teal-50" title="View brand" to={'/admin/brands/' + brand.slug}><ViewIcon /></Link><Link aria-label="Update brand" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50" title="Update brand" to={'/admin/brands/' + brand.slug + '/edit'}><EditIcon /></Link><button aria-label="Delete brand" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-50 disabled:opacity-50" disabled={isDeleting} onClick={() => handleDelete([brand])} title="Delete brand" type="button"><TrashIcon /></button></div></td></tr>)) : <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="11">No brands found.</td></tr>}</tbody></table></ScrollableTable></section>
      <Pagination currentPage={currentPage} onPageChange={setCurrentPage} perPage={perPage} total={filteredBrands.length} />
    </div>
  )
}
