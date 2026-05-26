import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getUser, updateUser } from '../api/userApi'
import { UserForm } from '../components/UserForm'

export function UserEditPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [user, setUser] = useState(null); const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(true); const [isSaving, setIsSaving] = useState(false)
  useEffect(() => { let active = true; getUser(id).then((data) => { if (active) setUser(data) }).catch((error) => { if (active) setError(error?.message ?? 'Could not load user.') }).finally(() => { if (active) setIsLoading(false) }); return () => { active = false } }, [id])
  async function handleSubmit(payload) { setError(''); setIsSaving(true); try { const updated = await updateUser(id, payload); navigate('/admin/users/' + updated.id, { replace: true }) } catch (error) { const first = error?.errors ? Object.values(error.errors).flat()[0] : null; setError(first ?? error?.message ?? 'Could not update user.') } finally { setIsSaving(false) } }
  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading user...</div>
  return <div className="grid gap-5"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Accounts</p><h1 className="mt-2 text-3xl font-black">Edit user</h1><p className="mt-2 text-sm font-medium text-slate-600">Update user #{id}.</p></div><Link className="h-fit rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to={'/admin/users/' + id}>Cancel</Link></div></section>{error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}<UserForm initialValues={user} isEdit isLoading={isSaving} onSubmit={handleSubmit} /></div>
}
