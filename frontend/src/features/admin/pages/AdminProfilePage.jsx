import { useEffect, useMemo, useState } from 'react'
import { updateCurrentUser, uploadCurrentUserAvatar } from '../../auth/api/authApi'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { useAuth } from '../../../shared/hooks/useAuth'

export function AdminProfilePage() {
  const { user } = useAuth()
  const [avatarFile, setAvatarFile] = useState(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState('')
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

  const avatarPreview = useMemo(() => avatarFile ? URL.createObjectURL(avatarFile) : null, [avatarFile])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

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
    setIsSaving(true)

    try {
      let avatar = values.avatar || null
      if (avatarFile) {
        const uploadedAvatar = await uploadCurrentUserAvatar(avatarFile)
        avatar = uploadedAvatar?.avatar ?? uploadedAvatar?.url ?? avatar
      }

      await updateCurrentUser({
        address: values.address || null,
        avatar,
        dob: values.dob || null,
        email: values.email,
        first_name: values.first_name || null,
        gender: values.gender || null,
        last_name: values.last_name || null,
        phone_number: values.phone_number || null,
        username: values.username,
      })
      setSuccess('Profile updated successfully.')
      window.setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      setError(error?.message ?? 'Could not update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Profile</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Admin profile</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Update your admin account, contact, and personal profile.</p>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      {success ? <div className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{success}</div> : null}

      <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="grid content-start gap-3">
            <p className="text-sm font-bold text-slate-700">Profile image</p>
            <label className="grid cursor-pointer place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-center text-sm font-bold text-slate-600 hover:border-teal-800 hover:bg-teal-50">
              <input
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  setAvatarFile(event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
                type="file"
              />
              {avatarPreview || values.avatar ? (
                <img alt="Profile" className="h-40 w-40 rounded-full object-cover" src={avatarPreview || values.avatar} />
              ) : (
                <span className="flex h-40 w-40 items-center justify-center rounded-full bg-teal-800 text-5xl font-black uppercase text-white">
                  {values.first_name?.[0] ?? values.username?.[0] ?? 'U'}
                </span>
              )}
              <span className="mt-3 block text-xs font-semibold text-slate-500">Click to upload JPG/PNG/WebP under 4 MB.</span>
            </label>
            {avatarFile ? <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" onClick={() => setAvatarFile(null)} type="button">Remove selected image</button> : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Username
              <Input name="username" onChange={handleChange} required value={values.username} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Email
              <Input name="email" onChange={handleChange} required type="email" value={values.email} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              First name
              <Input name="first_name" onChange={handleChange} value={values.first_name} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Last name
              <Input name="last_name" onChange={handleChange} value={values.last_name} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Phone number
              <Input maxLength="20" name="phone_number" onChange={handleChange} value={values.phone_number} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Date of birth
              <Input name="dob" onChange={handleChange} type="date" value={values.dob} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Gender
              <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="gender" onChange={handleChange} value={values.gender}>
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
              Address
              <textarea className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="address" onChange={handleChange} value={values.address} />
            </label>
          </div>
        </div>

        <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isSaving} type="submit">
          {isSaving ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </div>
  )
}
