export function Input({ className = '', ...props }) {
  return (
    <input
      className={'h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 ' + className}
      {...props}
    />
  )
}
