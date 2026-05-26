import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import { getActiveLogo } from '../features/logos/api/logoApi'
import { assetUrl } from '../shared/utils/assetUrl'

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Variant Types', to: '/admin/variant-types' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Brands', to: '/admin/brands' },
  { label: 'Banners', to: '/admin/banners' },
  { label: 'Logos', to: '/admin/logos' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Storefront', to: '/' },
]

const minSidebarWidth = 76
const maxSidebarWidth = 360
const defaultSidebarWidth = 288

function getSavedSidebarWidth() {
  const savedWidth = Number(localStorage.getItem('admin-sidebar-width'))

  if (!Number.isFinite(savedWidth)) {
    return defaultSidebarWidth
  }

  return Math.min(maxSidebarWidth, Math.max(minSidebarWidth, savedWidth))
}

export function AdminLayout({ children }) {
  const { logout, user } = useAuth()
  const avatar = user?.profile?.avatar
  const avatarInitial = (user?.first_name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()
  const [sidebarWidth, setSidebarWidth] = useState(getSavedSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    localStorage.setItem('admin-sidebar-width', String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    let active = true
    getActiveLogo().then((data) => {
      if (active) setLogo(data)
    }).catch(() => {
      if (active) setLogo(null)
    })
    return () => { active = false }
  }, [])

  async function handleAdminLogout() {
    await logout()
    window.location.href = '/admin/login'
  }

  function handleResizeStart(event) {
    event.preventDefault()
    setIsResizing(true)

    function handlePointerMove(moveEvent) {
      const nextWidth = Math.min(maxSidebarWidth, Math.max(minSidebarWidth, moveEvent.clientX))
      setSidebarWidth(nextWidth)
    }

    function handlePointerUp() {
      setIsResizing(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <div className={(isResizing ? 'cursor-col-resize select-none ' : '') + 'min-h-screen max-w-[100vw] overflow-x-hidden bg-slate-50 text-slate-950'}>
      <aside
        className="fixed inset-y-0 hidden border-r border-slate-200 bg-white py-6 md:block"
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-full min-w-0 flex-col overflow-hidden px-5">
          <Link className="flex min-w-0 items-center gap-3" title="TosTinh" to="/admin">
            {logo?.image ? (
              <img alt={logo.title ?? 'TosTinh logo'} className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-contain p-1" src={assetUrl(logo.image)} />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-800 text-lg font-black text-white">T</span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-2xl font-black tracking-tight">
                <span className="text-[#073f3d]">Tos</span><span className="text-[#0f7f84]">T</span><span className="text-[#f5a623]">i</span><span className="text-[#073f3d]">nh</span>
              </span>
              <span className="mt-1 block truncate text-sm font-bold uppercase tracking-wide text-teal-700">Admin dashboard</span>
            </span>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                aria-label={item.label}
                className={({ isActive }) =>
                  (isActive ? 'bg-teal-800 text-white ' : 'text-slate-700 hover:bg-slate-100 ') +
                  'block min-w-0 truncate rounded-md px-4 py-3 text-base font-bold'
                }
                end={item.to === '/admin'}
                key={item.label}
                title={item.label}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          aria-label="Resize sidebar"
          className={(isResizing ? 'bg-blue-500 ' : 'bg-transparent hover:bg-blue-500 ') + 'absolute inset-y-0 right-0 w-1 cursor-col-resize transition-colors'}
          onPointerDown={handleResizeStart}
          type="button"
        />
      </aside>
      <main
        className="min-w-0 max-w-[100vw]"
        style={{ marginLeft: sidebarWidth, maxWidth: 'calc(100vw - ' + sidebarWidth + 'px)' }}
      >
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-slate-950">Admin dashboard</p>
              <p className="text-xs font-semibold text-slate-500">{user?.email ?? 'Loading admin account'}</p>
            </div>
            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-left hover:border-teal-800 hover:bg-teal-50" type="button">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-800 text-sm font-bold uppercase text-white">
                    {avatar ? <img alt="Admin profile" className="h-full w-full object-cover" src={assetUrl(avatar)} /> : avatarInitial}
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="max-w-36 truncate text-sm font-black text-slate-950">
                      {user.first_name && user.last_name ? user.first_name + ' ' + user.last_name : user.username}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Admin</p>
                  </div>
                </button>

                <div className="invisible absolute right-0 top-full z-20 w-72 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                  <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <Link className="block rounded-md px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50" to="/admin/profile">
                      Profile
                    </Link>
                    <button className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-black text-red-700 hover:bg-red-50" onClick={handleAdminLogout} type="button">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </header>
        <div className="min-w-0 max-w-full overflow-hidden p-5">{children}</div>
      </main>
    </div>
  )
}
