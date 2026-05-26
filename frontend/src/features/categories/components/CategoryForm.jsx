import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'

export function CategoryForm({ initialValues = null, isLoading = false, onSubmit }) {
  const [values, setValues] = useState({
    name: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    if (!initialValues) return

    setValues({
      name: initialValues.name ?? '',
      description: initialValues.description ?? '',
      is_active: Boolean(initialValues.is_active),
    })
  }, [initialValues])

  function handleChange(event) {
    const { checked, name, type, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      name: values.name,
      description: values.description || null,
      is_active: values.is_active,
    })
  }

  return (
    <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Category name
        <Input maxLength="50" name="name" onChange={handleChange} required value={values.name} />
      </label>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Description
        <textarea className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="description" onChange={handleChange} value={values.description} />
      </label>

      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <input checked={values.is_active} name="is_active" onChange={handleChange} type="checkbox" /> Active
      </label>

      <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">
        {isLoading ? 'Saving...' : 'Save category'}
      </Button>
    </form>
  )
}
