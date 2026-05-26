export function Button({ className = '', ...props }) {
  return (
    <button
      className={'inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ' + className}
      {...props}
    />
  )
}
