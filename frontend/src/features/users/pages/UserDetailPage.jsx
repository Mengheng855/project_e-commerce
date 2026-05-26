import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { getUser } from '../api/userApi'

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-'
}

function locationOf(session) {
  if (session.city || session.country) return [session.city, session.country].filter(Boolean).join(', ')
  if (session.latitude && session.longitude) return session.latitude + ', ' + session.longitude
  return 'Unknown location'
}

export function UserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getUser(id)
      .then((data) => { if (active) setUser(data) })
      .catch((error) => { if (active) setError(error?.message ?? 'Could not load user.') })
    return () => { active = false }
  }, [id])

  if (error) return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
  if (!user) return <div className="rounded-lg border border-slate-200 bg-white p-6 font-bold text-slate-600">Loading user...</div>

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
  const sessions = user.login_sessions ?? []

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">User detail</p>
            <h1 className="mt-2 text-3xl font-black">{name}</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/admin/users">Back</Link>
            <Link className="rounded-md bg-teal-800 px-4 py-2 text-sm font-black text-white hover:bg-teal-900" to={'/admin/users/' + id + '/edit'}>Update user</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[180px_1fr]">
        <div>{user.profile?.avatar ? <img alt={name} className="h-36 w-36 rounded-full object-cover" src={assetUrl(user.profile.avatar)} /> : <div className="grid h-36 w-36 place-items-center rounded-full bg-teal-800 text-5xl font-black text-white">{name[0]}</div>}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Username" value={user.username} />
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.profile?.phone_number} />
          <Info label="Gender" value={user.profile?.gender} />
          <Info label="DOB" value={user.profile?.dob} />
          <Info label="Role" value={user.is_admin ? 'Admin' : 'Customer'} />
          <Info label="Status" value={user.is_active ? 'Active' : 'Inactive'} />
          <Info label="Created at" value={formatDate(user.created_at)} />
          <Info label="Address" value={user.profile?.address} wide />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Security</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Login devices</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">Recent devices and login locations tracked from this user's logins.</p>
        </div>
        <ScrollableTable>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">No.</th>
                <th className="px-5 py-3">Device</th>
                <th className="px-5 py-3">Browser</th>
                <th className="px-5 py-3">IP</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Logged in</th>
                <th className="px-5 py-3">Last active</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.length ? sessions.map((session, index) => (
                <tr className="text-slate-700" key={session.id}>
                  <td className="px-5 py-3 font-black text-slate-500">{index + 1}</td>
                  <td className="px-5 py-3"><p className="font-black text-slate-950">{session.device_name ?? '-'}</p><p className="text-xs font-semibold text-slate-500">{session.platform ?? '-'}</p></td>
                  <td className="px-5 py-3 font-semibold">{session.browser ?? '-'}</td>
                  <td className="px-5 py-3 font-semibold">{session.ip_address ?? '-'}</td>
                  <td className="px-5 py-3 font-semibold">{locationOf(session)}</td>
                  <td className="px-5 py-3 font-semibold">{formatDate(session.logged_in_at)}</td>
                  <td className="px-5 py-3 font-semibold">{formatDate(session.last_active_at)}</td>
                  <td className="px-5 py-3"><span className={(session.is_active ? 'bg-teal-50 text-teal-700 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>{session.is_active ? 'Active' : 'Logged out'}</span></td>
                </tr>
              )) : (
                <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="8">No login devices tracked yet. New logins will appear here.</td></tr>
              )}
            </tbody>
          </table>
        </ScrollableTable>
      </section>
    </div>
  )
}

function Info({ label, value, wide = false }) {
  return <div className={wide ? 'md:col-span-2' : ''}><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value || '-'}</p></div>
}
