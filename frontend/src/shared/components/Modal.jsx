export function Modal({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
      <div className="mt-4">{children}</div>
    </div>
  )
}
