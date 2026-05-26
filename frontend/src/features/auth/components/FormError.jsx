export function FormError({ error }) {
  if (!error) {
    return null
  }

  return <p className="text-sm font-semibold text-red-600">{Array.isArray(error) ? error[0] : error}</p>
}
