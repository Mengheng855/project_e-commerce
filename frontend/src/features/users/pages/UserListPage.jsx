import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '../../../shared/components/Pagination'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { deleteUser, getUsers } from '../api/userApi'

const perPage = 10
function ViewIcon() { return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg> }
function EditIcon() { return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg> }
function TrashIcon() { return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg> }

function formatDate(value) { return value ? new Date(value).toLocaleDateString() : '-' }
function nameOf(user) { return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username }

export function UserListPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { let active = true; getUsers({ per_page: 50 }).then((data) => { if (active) setUsers(data) }).finally(() => { if (active) setIsLoading(false) }); return () => { active = false } }, [])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesFilter = filter === 'All' || (filter === 'Admin' ? user.is_admin : !user.is_admin)
      const matchesSearch = !q || [user.username, user.email, user.first_name, user.last_name, user.profile?.phone_number].filter(Boolean).some((value) => String(value).toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
  }, [filter, search, users])
  useEffect(() => { setPage(1); setSelectedIds([]) }, [filter, search])
  const rows = filtered.slice((page - 1) * perPage, page * perPage)
  const selected = users.filter((user) => selectedIds.includes(user.id))
  const selectedSet = new Set(selectedIds)
  const allVisibleSelected = rows.length > 0 && rows.every((user) => selectedSet.has(user.id))

  function selectAll(checked) { const ids = rows.map((user) => user.id); setSelectedIds((current) => checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id))) }
  async function handleDelete(targetUsers) { if (!targetUsers.length) return; if (!window.confirm('Delete ' + targetUsers.length + ' user(s)?')) return; setIsDeleting(true); try { await Promise.all(targetUsers.map((user) => deleteUser(user.id))); const ids = targetUsers.map((user) => user.id); setUsers((current) => current.filter((user) => !ids.includes(user.id))); setSelectedIds((current) => current.filter((id) => !ids.includes(id))) } finally { setIsDeleting(false) } }

  return <div className="grid max-w-full gap-5 overflow-hidden">
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-teal-700">Accounts</p><h1 className="mt-2 text-3xl font-black text-slate-950">Users</h1></div><div className="flex flex-wrap gap-3"><div className="rounded-md border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">{isLoading ? 'Loading...' : filtered.length + ' users'}</div><Link className="rounded-md bg-teal-800 px-4 py-3 text-sm font-black text-white hover:bg-teal-900" to="/admin/users/create">Add user</Link></div></div></section>
    <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"><input className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" onChange={(e) => setSearch(e.target.value)} placeholder="Search username, email, phone" type="search" value={search} /><div className="flex flex-wrap gap-2">{['All', 'Admin', 'Customer'].map((item) => <button className={(filter === item ? 'bg-teal-800 text-white ' : 'bg-white text-teal-900 ') + 'rounded-md border border-teal-800 px-3 py-2 text-sm font-black'} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}</div></section>
    <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-bold text-slate-600">{selectedIds.length} selected</p><button className="rounded-md bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50" disabled={!selected.length || isDeleting} onClick={() => handleDelete(selected)} type="button">{isDeleting ? 'Deleting...' : 'Delete selected'}</button></section>
    <section className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><ScrollableTable><table className="w-full min-w-[1120px] text-left text-sm"><thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3"><input checked={allVisibleSelected} disabled={!rows.length || isDeleting} onChange={(e) => selectAll(e.target.checked)} type="checkbox" /></th><th className="px-5 py-3">No.</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{isLoading ? <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="9">Loading users...</td></tr> : rows.length ? rows.map((user, index) => <tr className="text-slate-700" key={user.id}><td className="px-5 py-3"><input checked={selectedSet.has(user.id)} disabled={isDeleting} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...new Set([...ids, user.id])] : ids.filter((id) => id !== user.id))} type="checkbox" /></td><td className="px-5 py-3 font-black text-slate-500">{(page - 1) * perPage + index + 1}</td><td className="px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-800 text-sm font-black uppercase text-white">
          {user.profile?.avatar ? <img alt={nameOf(user)} className="h-full w-full object-cover" src={assetUrl(user.profile.avatar)} /> : nameOf(user)[0]}
        </div>
        <div className="min-w-0">
          <p className="font-black text-slate-950">{nameOf(user)}</p>
          <p className="text-xs font-semibold text-slate-500">@{user.username}</p>
        </div>
      </div>
    </td><td className="px-5 py-3 font-semibold">{user.email}</td><td className="px-5 py-3 font-semibold">{user.profile?.phone_number ?? '-'}</td><td className="px-5 py-3"><span className={(user.is_admin ? 'bg-teal-50 text-teal-700 ' : 'bg-slate-100 text-slate-600 ') + 'rounded-md px-2 py-1 text-xs font-black'}>{user.is_admin ? 'Admin' : 'Customer'}</span></td><td className="px-5 py-3"><span className={(user.is_active ? 'bg-teal-50 text-teal-700 ' : 'bg-red-50 text-red-700 ') + 'rounded-md px-2 py-1 text-xs font-black'}>{user.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-5 py-3 font-semibold">{formatDate(user.created_at)}</td><td className="px-5 py-3"><div className="flex gap-2"><Link className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-teal-700 hover:bg-teal-50" to={'/admin/users/' + user.id}><ViewIcon /></Link><Link className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50" to={'/admin/users/' + user.id + '/edit'}><EditIcon /></Link><button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-red-600 hover:bg-red-50 disabled:opacity-50" disabled={isDeleting} onClick={() => handleDelete([user])} type="button"><TrashIcon /></button></div></td></tr>) : <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="9">No users found.</td></tr>}</tbody></table></ScrollableTable></section>
    <Pagination currentPage={page} onPageChange={setPage} perPage={perPage} total={filtered.length} />
  </div>
}
