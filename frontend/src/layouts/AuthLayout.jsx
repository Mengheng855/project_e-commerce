import { Link } from 'react-router-dom'

export function AuthLayout({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-white p-5 text-teal-950">
      <Link className="absolute left-5 top-5 inline-flex items-center rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" to="/">
        Back to home
      </Link>
      <div className="w-full">
        <div className="mb-6 text-center">
          <Link className="inline-flex items-center justify-center gap-3 text-2xl font-black tracking-tight text-teal-950" to="/">
            <img alt="TosTinh logo" className="h-12 w-12 rounded-md object-contain" src="/logo.png" />
            <span className="inline-flex items-baseline font-black tracking-tight">
              <span className="text-[#073f3d]">Tos</span><span className="text-[#0f7f84]">T</span><span className="text-[#f5a623]">i</span><span className="text-[#073f3d]">nh</span>
            </span>
          </Link>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </main>
  )
}
