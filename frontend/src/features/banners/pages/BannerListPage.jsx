import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '../../../shared/components/Pagination'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { deleteBanner, getBanners } from '../api/bannerApi'

const perPage = 10
const filters = ['All', 'Active', 'Inactive']

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '-'
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

export function BannerListPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [banners, setBanners] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getBanners()
        if (active) setBanners(data)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const filteredBanners = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return banners.filter((banner) => {
      const matchesStatus = activeFilter === 'All' || Boolean(banner.is_active) === (activeFilter === 'Active')
      const matchesSearch = !normalizedSearch || [banner.title, banner.text, banner.sort_order].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch))
      return matchesStatus && matchesSearch
    })
  }, [activeFilter, banners, search])

  useEffect(() => { setCurrentPage(1); setSelectedIds([]) }, [activeFilter, search])
  const paginatedBanners = useMemo(() => filteredBanners.slice((currentPage - 1) * perPage, currentPage * perPage), [currentPage, filteredBanners])
  const selectedBanners = banners.filter((banner) => selectedIds.includes(banner.id))
  const selectedSet = new Set(selectedIds)
  const allVisibleSelected = paginatedBanners.length > 0 && paginatedBanners.every((banner) => selectedSet.has(banner.id))

  function handleSelectAll(checked) {
    const visibleIds = paginatedBanners.map((banner) => banner.id)
    setSelectedIds((currentIds) => checked ? [...new Set([...currentIds, ...visibleIds])] : currentIds.filter((id) => !visibleIds.includes(id)))
  }

  async function handleDelete(targetBanners) {
    if (!targetBanners.length) return
    const ok = window.confirm('Delete ' + targetBanners.length + ' banner(s)?')
    if (!ok) return
    setIsDeleting(true)
    try {
      await Promise.all(targetBanners.map((banner) => deleteBanner(banner.id)))
      const deletedIds = targetBanners.map((banner) => banner.id)
      setBanners((current) => current.filter((banner) => !deletedIds.includes(banner.id)))
      setSelectedIds((currentIds) => currentIds.filter((id) => !deletedIds.includes(id)))
    } finally { setIsDeleting(false) }
  }

  return (
    <div className="grid max-w-full gap-5 overflow-hidden">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Content</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Banners</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-md border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">{isLoading ? 'Loading...' : filteredBanners.length + ' banners'}</div>
            <Link className="rounded-md bg-teal-800 px-4 py-3 text-sm font-black text-white hover:bg-teal-900" to="/admin/banners/create">
              Add banner
            </Link>
          </div>
        </div>
      </section>

      <section className="grid max-w-full gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <input
          className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, banner text, order"
          type="search"
          value={search}
        />
        <div className="flex max-w-full flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={(activeFilter === filter ? 'bg-teal-800 text-white ' : 'bg-white text-teal-900 ') + 'rounded-md border border-teal-800 px-3 py-2 text-sm font-black'}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-600">{selectedIds.length} selected</p>
        <button
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedBanners.length || isDeleting}
          onClick={() => handleDelete(selectedBanners)}
          type="button"
        >
          {isDeleting ? 'Deleting...' : 'Delete selected'}
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <ScrollableTable>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  <input
                    checked={allVisibleSelected}
                    disabled={!paginatedBanners.length || isDeleting}
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    type="checkbox"
                  />
                </th>
                <th className="px-5 py-3">No.</th>
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Text</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="9">Loading banners...</td>
                </tr>
              ) : paginatedBanners.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="9">No banners found.</td>
                </tr>
              ) : (
                paginatedBanners.map((banner, index) => (
                  <tr className="text-slate-700" key={banner.id}>
                    <td className="px-5 py-3">
                      <input
                        checked={selectedSet.has(banner.id)}
                        disabled={isDeleting}
                        onChange={() => setSelectedIds((ids) => ids.includes(banner.id) ? ids.filter((id) => id !== banner.id) : [...ids, banner.id])}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-5 py-3 font-black text-slate-500">{(currentPage - 1) * perPage + index + 1}</td>
                    <td className="px-5 py-3">
                      {banner.image ? (
                        <img alt={banner.text ?? 'Banner'} className="h-12 w-20 rounded-md object-cover" src={assetUrl(banner.image)} />
                      ) : (
                        <div className="h-12 w-20 rounded-md bg-slate-200" />
                      )}
                    </td>
                    <td className="px-5 py-3 font-black text-slate-950">{banner.title ?? '-'}</td>
                    <td className="px-5 py-3 font-semibold">{banner.text ?? '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-black ${banner.is_active ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-black text-slate-950">{banner.sort_order}</td>
                    <td className="px-5 py-3 font-semibold">{formatDate(banner.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          aria-label="View banner"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-teal-700 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-800"
                          title="View banner"
                          to={'/admin/banners/' + banner.id}
                        >
                          <ViewIcon />
                        </Link>
                        <Link
                          aria-label="Edit banner"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50 hover:text-slate-950"
                          title="Edit banner"
                          to={'/admin/banners/' + banner.id + '/edit'}
                        >
                          <EditIcon />
                        </Link>
                        <button
                          aria-label="Delete banner"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isDeleting}
                          onClick={() => handleDelete([banner])}
                          type="button"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollableTable>
        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} perPage={perPage} total={filteredBanners.length} />
      </section>
    </div>
  )
}
