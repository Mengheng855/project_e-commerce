import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../features/categories/api/categoryApi'
import { getActiveLogo } from '../features/logos/api/logoApi'
import { assetUrl } from '../shared/utils/assetUrl'
import { useAuth } from '../shared/hooks/useAuth'

const footerLinks = ['Products', 'Warranty', 'Delivery', 'Support']
const categoryLinks = ['Laptops', 'Phones', 'Keyboards', 'Monitors']

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  )
}

export function StoreLayout({ children }) {
  const { isAuthenticated, logout, user } = useAuth()
  const avatar = user?.profile?.avatar
  const avatarInitial = (user?.first_name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()
  const [logo, setLogo] = useState(null)
  const [categories, setCategories] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const logoSrc = logo?.image ? assetUrl(logo.image) : '/logo.png'

  function handleLogoError(event) {
    if (event.currentTarget.src !== window.location.origin + '/logo.png') {
      event.currentTarget.src = '/logo.png'
    }
  }

  useEffect(() => {
    let active = true
    getActiveLogo().then((data) => {
      if (active) setLogo(data)
    }).catch(() => {
      if (active) setLogo(null)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    getCategories({ has_products: true, per_page: 50 }).then((data) => {
      if (active) setCategories(data.filter((category) => category.is_active !== false))
    }).catch(() => {
      if (active) setCategories([])
    })
    return () => { active = false }
  }, [])

  return (
    <main className="min-h-screen bg-white text-teal-950">
      <header className="sticky top-0 z-20 border-b border-teal-900/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link className="flex items-center gap-3 text-xl font-black tracking-tight text-teal-950" to="/">
            <img alt={logo?.title ?? 'TosTinh logo'} className="h-10 w-10 rounded-md object-contain" onError={handleLogoError} src={logoSrc} />
            <span className="inline-flex items-baseline font-black tracking-tight">
              <span className="text-[#073f3d]">Tos</span><span className="text-[#0f7f84]">T</span><span className="text-[#f5a623]">i</span><span className="text-[#073f3d]">nh</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm font-semibold text-teal-900 hover:text-teal-700" to="/">
              Home
            </Link>
            <Link className="text-sm font-semibold text-teal-900 hover:text-teal-700" to="/products">
              Product
            </Link>
            <div className="group relative">
              <button className="inline-flex items-center gap-1 text-sm font-semibold text-teal-900 hover:text-teal-700" type="button">
                Category
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="invisible absolute left-1/2 top-full z-30 w-52 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-teal-900/15 bg-white" />
                <div className="relative rounded-md border border-teal-900/10 bg-white p-2 shadow-lg">
                  {categories.length ? categories.map((category) => (
                    <Link className="block rounded px-3 py-2 text-sm font-bold text-teal-900 hover:bg-teal-50 hover:underline hover:underline-offset-4" key={category.id} to={'/products?category=' + category.slug}>
                      {category.name}
                    </Link>
                  )) : (
                    <span className="block rounded px-3 py-2 text-sm font-bold text-teal-900/50">No categories</span>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              className="grid h-10 w-10 place-items-center rounded-md border border-teal-800 text-teal-900 hover:bg-teal-800 hover:text-white md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                {isMenuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
            {isAuthenticated ? (
              <>
                <Link aria-label="Cart" className="hidden h-10 w-10 place-items-center rounded-md border border-teal-800 text-teal-900 hover:bg-teal-800 hover:text-white md:grid" onClick={() => setIsMenuOpen(false)} title="Cart" to="/cart">
                  <CartIcon />
                </Link>
                <div className="group relative hidden md:block">
                  <button aria-label="Account menu" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-teal-800 bg-teal-800 text-sm font-black uppercase text-white hover:bg-teal-900" type="button">
                    {avatar ? <img alt="Profile" className="h-full w-full object-cover" src={assetUrl(avatar)} /> : avatarInitial}
                  </button>
                  <div className="invisible absolute right-0 top-full z-30 w-44 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="rounded-lg border border-teal-900/15 bg-white p-2 shadow-lg">
                      <Link className="block rounded-md px-3 py-2 text-sm font-black text-teal-900 hover:bg-teal-50" to="/profile">
                        Profile
                      </Link>
                      <Link className="mt-1 block rounded-md px-3 py-2 text-sm font-black text-teal-900 hover:bg-teal-50" to="/orders">
                        Orders
                      </Link>
                      <button className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm font-black text-red-600 hover:bg-red-50" onClick={logout} type="button">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link className="hidden rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white sm:inline-flex" onClick={() => setIsMenuOpen(false)} to="/login">
                  Login
                </Link>
                <Link className="hidden rounded-md bg-teal-800 px-4 py-2 text-sm font-bold text-white hover:bg-teal-900 sm:inline-flex" onClick={() => setIsMenuOpen(false)} to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

      </header>
            <div className={(isMenuOpen ? 'pointer-events-auto opacity-100 ' : 'pointer-events-none opacity-0 ') + 'fixed inset-0 z-40 bg-teal-950/35 transition-opacity md:hidden'} onClick={() => setIsMenuOpen(false)} />
      <aside className={(isMenuOpen ? 'translate-x-0 ' : 'translate-x-full ') + 'fixed inset-y-0 right-0 z-50 w-[82vw] max-w-xs border-l border-teal-900/10 bg-white shadow-2xl transition-transform duration-300 md:hidden'}>
        <div className="flex items-center justify-between border-b border-teal-900/10 px-4 py-4">
          {isAuthenticated ? (
            <Link className="flex min-w-0 items-center gap-3" onClick={() => setIsMenuOpen(false)} to="/profile">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-teal-800 bg-teal-800 text-base font-black uppercase text-white">
                {avatar ? <img alt="Profile" className="h-full w-full object-cover" src={assetUrl(avatar)} /> : avatarInitial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-teal-950">{user?.first_name && user?.last_name ? user.first_name + ' ' + user.last_name : user?.username}</span>
                <span className="block truncate text-xs font-bold text-teal-700">View profile</span>
              </span>
            </Link>
          ) : (
            <Link className="flex items-center gap-2 text-lg font-black" onClick={() => setIsMenuOpen(false)} to="/">
              <img alt={logo?.title ?? 'TosTinh logo'} className="h-8 w-8 rounded-md object-contain" onError={handleLogoError} src={logoSrc} />
              <span className="inline-flex items-baseline font-black tracking-tight">
                <span className="text-[#073f3d]">Tos</span><span className="text-[#0f7f84]">T</span><span className="text-[#f5a623]">i</span><span className="text-[#073f3d]">nh</span>
              </span>
            </Link>
          )}
          <button className="grid h-9 w-9 place-items-center rounded-md border border-teal-800 text-teal-900" onClick={() => setIsMenuOpen(false)} type="button">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="grid gap-1 px-4 py-4">
          <Link className="rounded-md px-3 py-3 text-base font-black text-teal-950 hover:bg-teal-50" onClick={() => setIsMenuOpen(false)} to="/">
            Home
          </Link>
          <Link className="rounded-md px-3 py-3 text-base font-black text-teal-950 hover:bg-teal-50" onClick={() => setIsMenuOpen(false)} to="/products">
            Product
          </Link>
          <details className="rounded-md">
            <summary className="cursor-pointer list-none rounded-md px-3 py-3 text-base font-black text-teal-950 hover:bg-teal-50">
              Category
            </summary>
            <div className="ml-3 grid max-h-48 gap-1 overflow-y-auto border-l border-teal-900/15 pl-3">
              {categories.length ? categories.map((category) => (
                <Link className="rounded-md px-3 py-2 text-sm font-bold text-teal-900 hover:bg-teal-50" key={category.id} onClick={() => setIsMenuOpen(false)} to={'/products?category=' + category.slug}>
                  {category.name}
                </Link>
              )) : (
                <span className="rounded-md px-3 py-2 text-sm font-bold text-teal-900/50">No categories</span>
              )}
            </div>
          </details>
          {isAuthenticated ? (
            <>
              <Link className="rounded-md px-3 py-3 text-base font-black text-teal-950 hover:bg-teal-50" onClick={() => setIsMenuOpen(false)} to="/cart">
                Cart
              </Link>
              <Link className="rounded-md px-3 py-3 text-base font-black text-teal-950 hover:bg-teal-50" onClick={() => setIsMenuOpen(false)} to="/profile">
                Profile
              </Link>
              <Link className="rounded-md px-3 py-3 text-base font-black text-teal-950 hover:bg-teal-50" onClick={() => setIsMenuOpen(false)} to="/orders">
                Orders
              </Link>
              <button className="rounded-md px-3 py-3 text-left text-base font-black text-red-600 hover:bg-red-50" onClick={() => { setIsMenuOpen(false); logout() }} type="button">
                Logout
              </button>
            </>
          ) : (
            <div className="mt-3 grid gap-2 border-t border-teal-900/10 pt-4">
              <Link className="rounded-md border border-teal-800 px-4 py-3 text-center text-sm font-black text-teal-900" onClick={() => setIsMenuOpen(false)} to="/login">
                Login
              </Link>
              <Link className="rounded-md bg-teal-800 px-4 py-3 text-center text-sm font-black text-white" onClick={() => setIsMenuOpen(false)} to="/register">
                Register
              </Link>
            </div>
          )}
        </nav>
      </aside>
      {children}
      <footer className="border-t border-teal-900/15 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link className="flex items-center gap-3 text-2xl font-black tracking-tight text-teal-950" to="/">
              <img alt={logo?.title ?? 'TosTinh logo'} className="h-10 w-10 rounded-md object-contain" onError={handleLogoError} src={logoSrc} />
              <span className="inline-flex items-baseline font-black tracking-tight">
              <span className="text-[#073f3d]">Tos</span><span className="text-[#0f7f84]">T</span><span className="text-[#f5a623]">i</span><span className="text-[#073f3d]">nh</span>
            </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-teal-900/75">
              Clean electronics shopping for computers, phones, accessories, and daily tech essentials.
            </p>
            <div className="mt-5 flex gap-2">
              {['FB', 'IG', 'TG'].map((item) => (
                <a
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-teal-800 text-xs font-black text-teal-900 hover:bg-teal-800 hover:text-white"
                  href="#"
                  key={item}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-teal-950">Shop</h3>
            <div className="mt-4 grid gap-2">
              {(categories.length ? categories : categoryLinks.map((name) => ({ id: name, name }))).map((category) => (
                <Link className="text-sm font-semibold text-teal-900/75 hover:text-teal-950" key={category.id} to={category.slug ? '/products?category=' + category.slug : '/products'}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-teal-950">Help</h3>
            <div className="mt-4 grid gap-2">
              {footerLinks.map((item) => (
                <a className="text-sm font-semibold text-teal-900/75 hover:text-teal-950" href="#" key={item}>
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-teal-900/15 p-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-teal-950">Contact</h3>
            <div className="mt-4 space-y-2 text-sm font-semibold text-teal-900/75">
              <p>Phnom Penh, Cambodia</p>
              <p>support@tostinh.test</p>
              <p>Mon-Sat, 8:00-18:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-teal-900/15 px-5 py-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm font-semibold text-teal-900/70 md:flex-row md:items-center md:justify-between">
            <p>© 2026 TosTinh. All rights reserved.</p>
            <p>White and teal electronics storefront.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
