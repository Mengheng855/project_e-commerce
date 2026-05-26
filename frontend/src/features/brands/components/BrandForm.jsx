import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'

export function BrandForm({ initialValues = null, isLoading = false, onSubmit }) {
  const [values, setValues] = useState({
    name: '',
    logo: '',
    description: '',
    website: '',
    is_active: true,
  })

  useEffect(() => {
    if (!initialValues) return

    setValues({
      name: initialValues.name ?? '',
      logo: initialValues.logo ?? '',
      description: initialValues.description ?? '',
      website: initialValues.website ?? '',
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
      logo: values.logo || null,
      description: values.description || null,
      website: values.website || null,
      is_active: values.is_active,
    })
  }

  return (
    <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Brand name
          <Input maxLength="100" name="name" onChange={handleChange} required value={values.name} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Website
          <Input name="website" onChange={handleChange} placeholder="https://example.com" type="url" value={values.website} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
          Logo URL/path
          <Input name="logo" onChange={handleChange} value={values.logo} />
          {values.logo ? <img alt="Brand logo preview" className="h-16 w-16 rounded-md border border-slate-200 object-cover" src={values.logo} /> : null}
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Description
        <textarea className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="description" onChange={handleChange} value={values.description} />
      </label>

      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <input checked={values.is_active} name="is_active" onChange={handleChange} type="checkbox" /> Active
      </label>

      <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">
        {isLoading ? 'Saving...' : 'Save brand'}
      </Button>
    </form>
  )
}
