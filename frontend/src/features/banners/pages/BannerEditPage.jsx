import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getBanner, updateBanner } from '../api/bannerApi'
import { BannerForm } from '../components/BannerForm'
import { prepareBannerPayload } from '../utils/bannerPayload'

export function BannerEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [banner, setBanner] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getBanner(id)
        if (active) setBanner(data)
      } catch (err) {
        if (active) setError(err?.message ?? 'Failed to load banner')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  async function handleSubmit(values) {
    setError('')
    setIsSaving(true)
    try {
      const payload = await prepareBannerPayload(values)
      const updated = await updateBanner(id, payload)
      navigate('/admin/banners/' + updated.id, { replace: true })
    } catch (error) {
      setError(error?.message ?? 'Could not update banner.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading banner...</div>

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Content</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Edit banner</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">Update banner #{id}</p>
          </div>
          <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to={'/admin/banners/' + id}>
            Cancel
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <BannerForm initialValues={banner} isLoading={isSaving} onSubmit={handleSubmit} />
    </div>
  )
}
