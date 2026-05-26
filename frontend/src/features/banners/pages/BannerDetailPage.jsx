import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBanner } from '../api/bannerApi'

export function BannerDetailPage() {
  const { id } = useParams()
  const [banner, setBanner] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getBanner(id)
        if (active) setBanner(data)
      } catch (error) {
        console.error('Failed to load banner:', error)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading banner...</div>
  }

  if (!banner) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Banner not found.</div>
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Banner detail</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{banner.title ?? 'Banner #' + banner.id}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white"
              to="/admin/banners"
            >
              Back
            </Link>
            <Link
              className="rounded-md bg-teal-800 px-4 py-2 text-sm font-bold text-white hover:bg-teal-900"
              to={'/admin/banners/' + banner.id + '/edit'}
            >
              Edit
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        {banner.image && (
          <div className="md:col-span-2">
            <img alt={banner.text ?? 'Banner'} className="h-64 w-full rounded-lg object-cover" src={banner.image} />
          </div>
        )}
        {banner.foreground_image && (
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Foreground</p>
            <img alt="Foreground" className="mt-1 h-40 w-full rounded-lg object-cover" src={banner.foreground_image} />
          </div>
        )}
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Hero title</p>
          <p className="mt-1 font-semibold text-slate-800">{banner.title ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Text</p>
          <p className="mt-1 font-semibold text-slate-800">{banner.text ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Status</p>
          <p className="mt-1 font-semibold text-slate-800">{banner.is_active ? 'Active' : 'Inactive'}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Sort order</p>
          <p className="mt-1 font-semibold text-slate-950">{banner.sort_order}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Created at</p>
          <p className="mt-1 font-semibold text-slate-800">{banner.created_at ? new Date(banner.created_at).toLocaleString() : '-'}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Updated at</p>
          <p className="mt-1 font-semibold text-slate-800">{banner.updated_at ? new Date(banner.updated_at).toLocaleString() : '-'}</p>
        </div>
      </section>
    </div>
  )
}
