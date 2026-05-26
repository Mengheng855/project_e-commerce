import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUser } from '../api/userApi'
import { UserForm } from '../components/UserForm'

export function UserCreatePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  async function handleSubmit(payload) { setError(''); setIsSaving(true); try { const user = await createUser(payload); navigate('/admin/users/' + user.id, { replace: true }) } catch (error) { const first = error?.errors ? Object.values(error.errors).flat()[0] : null; setError(first ?? error?.message ?? 'Could not create user.') } finally { setIsSaving(false) } }
  return <div className="grid gap-5"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Accounts</p><h1 className="mt-2 text-3xl font-black">Add user</h1><p className="mt-2 text-sm font-medium text-slate-600">Create a new customer account.</p></div><Link className="h-fit rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/users">Cancel</Link></div></section>{error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}<UserForm isLoading={isSaving} onSubmit={handleSubmit} /></div>
}
