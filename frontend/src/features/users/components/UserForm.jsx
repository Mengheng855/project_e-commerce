import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'

export function UserForm({ initialValues = null, isEdit = false, isLoading = false, onSubmit }) {
  const [values, setValues] = useState({
    username: '', email: '', password: '', password_confirmation: '', first_name: '', last_name: '',
    phone_number: '', gender: '', dob: '', address: '', is_admin: false, is_active: true,
  })

  useEffect(() => {
    if (!initialValues) return
    setValues({
      username: initialValues.username ?? '',
      email: initialValues.email ?? '',
      password: '',
      password_confirmation: '',
      first_name: initialValues.first_name ?? '',
      last_name: initialValues.last_name ?? '',
      phone_number: initialValues.profile?.phone_number ?? '',
      gender: initialValues.profile?.gender ?? '',
      dob: initialValues.profile?.dob ?? '',
      address: initialValues.profile?.address ?? '',
      is_admin: Boolean(initialValues.is_admin),
      is_active: initialValues.is_active !== false,
    })
  }, [initialValues])

  function handleChange(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      username: values.username,
      email: values.email,
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      phone_number: values.phone_number || null,
      gender: values.gender || null,
      dob: values.dob || null,
      address: values.address || null,
      is_admin: values.is_admin,
      is_active: values.is_active,
    }
    if (values.password) {
      payload.password = values.password
      payload.password_confirmation = values.password_confirmation
    }
    onSubmit(payload)
  }

  return (
    <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">Username<Input name="username" onChange={handleChange} required value={values.username} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Email<Input name="email" onChange={handleChange} required type="email" value={values.email} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">First name<Input name="first_name" onChange={handleChange} value={values.first_name} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Last name<Input name="last_name" onChange={handleChange} value={values.last_name} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Password<Input name="password" onChange={handleChange} required={!isEdit} type="password" value={values.password} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Confirm password<Input name="password_confirmation" onChange={handleChange} required={!isEdit || Boolean(values.password)} type="password" value={values.password_confirmation} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Phone number<Input maxLength="20" name="phone_number" onChange={handleChange} value={values.phone_number} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Date of birth<Input name="dob" onChange={handleChange} type="date" value={values.dob} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Gender<select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="gender" onChange={handleChange} value={values.gender}><option value="">Not set</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
        <div className="flex flex-wrap items-center gap-5 pt-7"><label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input checked={values.is_admin} name="is_admin" onChange={handleChange} type="checkbox" /> Admin</label><label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input checked={values.is_active} name="is_active" onChange={handleChange} type="checkbox" /> Active</label></div>
        <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">Address<textarea className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="address" onChange={handleChange} value={values.address} /></label>
      </div>
      <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">{isLoading ? 'Saving...' : 'Save user'}</Button>
    </form>
  )
}
