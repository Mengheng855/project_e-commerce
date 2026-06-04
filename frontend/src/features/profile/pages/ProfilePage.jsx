import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { updateCurrentUser, uploadCurrentUserAvatar } from '../../auth/api/authApi'
import { Input } from '../../../shared/components/Input'
import { useAuth } from '../../../shared/hooks/useAuth'
import { assetUrl } from '../../../shared/utils/assetUrl'

function safeReturnPath(value) {
  const fallback = '/profile'
  const allowedPaths = new Set(['/cart', '/orders', '/profile'])

  if (!value) return '/cart'

  try {
    const parsed = new URL(value, window.location.origin)

    if (parsed.origin !== window.location.origin || !allowedPaths.has(parsed.pathname)) {
      return fallback
    }

    return parsed.pathname + parsed.search + parsed.hash
  } catch {
    return fallback
  }
}

export function ProfilePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [values, setValues] = useState({
    address: '',
    avatar: '',
    dob: '',
    email: '',
    first_name: '',
    gender: '',
    last_name: '',
    phone_number: '',
    username: '',
  })

  const returnTo = safeReturnPath(new URLSearchParams(location.search).get('return_to'))
  const needsPhone = new URLSearchParams(location.search).get('need_phone') === '1'
  const avatarPreview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile])
  const currentAvatar = avatarPreview || assetUrl(values.avatar)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (!user) return

    setValues({
      address: user.profile?.address ?? '',
      avatar: user.profile?.avatar ?? '',
      dob: user.profile?.dob ?? '',
      email: user.email ?? '',
      first_name: user.first_name ?? '',
      gender: user.profile?.gender ?? '',
      last_name: user.last_name ?? '',
      phone_number: user.profile?.phone_number ?? '',
      username: user.username ?? '',
    })
    setAvatarFile(null)
  }, [user])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!values.phone_number.trim()) {
      setError('Phone number is required before checkout.')
      return
    }

    setIsSaving(true)
    try {
      let avatar = values.avatar || null

      if (avatarFile) {
        const uploadedAvatar = await uploadCurrentUserAvatar(avatarFile)
        avatar = uploadedAvatar?.avatar ?? uploadedAvatar?.url ?? uploadedAvatar?.path ?? avatar
      }

      await updateCurrentUser({
        address: values.address || null,
        avatar,
        dob: values.dob || null,
        email: values.email,
        first_name: values.first_name || null,
        gender: values.gender || null,
        last_name: values.last_name || null,
        phone_number: values.phone_number,
        username: values.username,
      })
      setSuccess('Profile updated.')
      window.setTimeout(() => {
        navigate(returnTo, { replace: true })
      }, 400)
    } catch (error) {
      const firstFieldError = error?.errors ? Object.values(error.errors).flat()[0] : null
      setError(firstFieldError ?? error?.message ?? 'Could not update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-5 py-12 text-sm font-black text-teal-900">Loading profile...</div>
  }

  return (
    <section className="mx-auto grid max-w-3xl gap-6 px-5 py-10">
      <div className="border-b border-teal-900/15 pb-6">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Profile</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-teal-950">Your profile</h1>
        <p className="mt-2 text-sm font-semibold text-teal-900/70">Keep your contact info ready for checkout.</p>
      </div>

      {needsPhone ? <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Please add your phone number before checkout.</p> : null}
      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
      {success ? <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700">{success}</p> : null}

      <form className="grid gap-5 rounded-lg border border-teal-900/15 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
          <div className="grid content-start gap-3">
            <p className="text-sm font-bold text-teal-900">Profile image</p>
            <label className="grid cursor-pointer place-items-center rounded-lg border-2 border-dashed border-teal-900/20 bg-white p-3 text-center text-sm font-bold text-teal-900/70 hover:border-teal-800 hover:bg-teal-50">
              <input
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  setAvatarFile(event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
                type="file"
              />
              {currentAvatar ? (
                <img alt="Profile" className="h-32 w-32 rounded-full object-cover" src={currentAvatar} />
              ) : (
                <span className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-800 text-4xl font-black uppercase text-white">
                  {values.first_name?.[0] ?? values.username?.[0] ?? 'U'}
                </span>
              )}
              <span className="mt-3 block text-xs font-semibold text-teal-900/60">Click to upload JPG, PNG, or WebP.</span>
            </label>
            {avatarFile ? (
              <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" onClick={() => setAvatarFile(null)} type="button">
                Remove selected image
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-teal-900">
            Username
            <Input name="username" onChange={handleChange} required value={values.username} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900">
            Email
            <Input name="email" onChange={handleChange} required type="email" value={values.email} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900">
            First name
            <Input name="first_name" onChange={handleChange} value={values.first_name} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900">
            Last name
            <Input name="last_name" onChange={handleChange} value={values.last_name} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900 md:col-span-2">
            Phone number
            <Input maxLength="20" name="phone_number" onChange={handleChange} placeholder="012345678" required value={values.phone_number} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900">
            Date of birth
            <Input name="dob" onChange={handleChange} type="date" value={values.dob} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900">
            Gender
            <select className="h-10 rounded-md border border-teal-900/20 bg-white px-3 text-sm font-semibold text-teal-950 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="gender" onChange={handleChange} value={values.gender}>
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-teal-900 md:col-span-2">
            Address
            <textarea className="min-h-28 rounded-md border border-teal-900/20 bg-white px-3 py-2 text-sm text-teal-950 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="address" onChange={handleChange} value={values.address} />
          </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-teal-800 px-5 py-3 text-sm font-black text-white hover:bg-teal-900 disabled:opacity-50" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
          <Link className="rounded-md border border-teal-800 px-5 py-3 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white" to={returnTo}>
            Back
          </Link>
        </div>
      </form>
    </section>
  )
}
