import { Link, useLocation } from 'react-router-dom'
import { Seo } from '../../../shared/seo/Seo'

export function NotFoundPage({ homePath = '/', homeText = 'Back to home', showProducts = true }) {
  const location = useLocation()

  return (
    <section className="min-h-[70vh] bg-white px-5 py-12">
      <Seo canonical={location.pathname} robots="noindex, follow" title="Page not found" />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">404 not found</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-teal-950 md:text-6xl">
            This page is not available.
          </h1>
          <p className="mt-5 max-w-xl text-base font-bold leading-7 text-teal-900/75">
            The link may be broken, moved, or no longer exists. You can return to a working page and continue shopping.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="rounded-md bg-teal-800 px-5 py-3 text-sm font-black text-white hover:bg-teal-900" to={homePath}>
              {homeText}
            </Link>
            {showProducts ? (
              <Link className="rounded-md border border-teal-800 px-5 py-3 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white" to="/products">
                Browse products
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-72 overflow-hidden rounded-lg border border-teal-900/10 bg-slate-100">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_52%,#ccfbf1_100%)]" />
          <div className="absolute left-8 top-8 rounded-md bg-white/75 px-4 py-3 text-sm font-black text-teal-950 shadow-sm">
            Lost link
          </div>
          <div className="absolute bottom-8 left-8 right-8 rounded-lg border border-teal-900/10 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <img alt="TosTinh" className="h-14 w-14 rounded-md object-contain" src="/logo.png" />
              <div>
                <p className="text-5xl font-black tracking-tight text-teal-950">404</p>
                <p className="mt-1 text-sm font-bold text-teal-900/70">TosTinh can still take you somewhere useful.</p>
              </div>
            </div>
          </div>
          <div className="absolute right-10 top-12 h-24 w-36 rounded-md bg-teal-900/10" />
          <div className="absolute right-28 top-32 h-16 w-28 rounded-md bg-white/60" />
        </div>
      </div>
    </section>
  )
}
