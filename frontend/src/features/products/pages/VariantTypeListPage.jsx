import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { createVariantType, deleteVariantType, getVariantTypes, updateVariantType } from '../api/productApi'

function EditIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
}
function TrashIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>
}

export function VariantTypeListPage() {
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [variantTypes, setVariantTypes] = useState([])

  async function loadVariantTypes() {
    const data = await getVariantTypes()
    setVariantTypes(data)
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getVariantTypes()
        if (active) setVariantTypes(data)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const filteredVariantTypes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return variantTypes

    return variantTypes.filter((variantType) => variantType.name.toLowerCase().includes(normalizedSearch))
  }, [search, variantTypes])

  function startEdit(variantType) {
    setEditingId(variantType.id)
    setName(variantType.name)
    setError('')
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      if (editingId) {
        await updateVariantType(editingId, { name })
      } else {
        await createVariantType({ name })
      }
      resetForm()
      await loadVariantTypes()
    } catch (error) {
      setError(error?.message ?? 'Could not save variant type.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(variantType) {
    const ok = window.confirm('Delete variant type "' + variantType.name + '"?')
    if (!ok) return

    setError('')
    setIsSaving(true)
    try {
      await deleteVariantType(variantType.id)
      await loadVariantTypes()
      if (editingId === variantType.id) resetForm()
    } catch (error) {
      setError(error?.message ?? 'Could not delete variant type.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Catalog</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Variant types</h1>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">{editingId ? 'Edit type' : 'Add type'}</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{editingId ? 'Update variant type' : 'New variant type'}</h2>
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Name
            <Input maxLength="50" name="name" onChange={(event) => setName(event.target.value)} placeholder="Color, Storage, RAM" required value={name} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : editingId ? 'Update type' : 'Add type'}
            </Button>
            {editingId ? <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={resetForm} type="button">Cancel</button> : null}
          </div>
        </form>

        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black text-slate-950">All variant types</p>
              <p className="text-sm font-semibold text-slate-500">{isLoading ? 'Loading...' : filteredVariantTypes.length + ' type(s)'}</p>
            </div>
            <input className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" onChange={(event) => setSearch(event.target.value)} placeholder="Search type" type="search" value={search} />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">No.</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Variants</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="4">Loading variant types...</td></tr> : filteredVariantTypes.length ? filteredVariantTypes.map((variantType, index) => (
                  <tr key={variantType.id}>
                    <td className="px-5 py-3 font-black text-slate-500">{index + 1}</td>
                    <td className="px-5 py-3 font-black text-slate-950">{variantType.name}</td>
                    <td className="px-5 py-3 font-semibold text-slate-700">{variantType.variants_count ?? 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button aria-label="Edit variant type" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50" onClick={() => startEdit(variantType)} title="Edit" type="button"><EditIcon /></button>
                        <button aria-label="Delete variant type" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-50 disabled:opacity-50" disabled={isSaving || (variantType.variants_count ?? 0) > 0} onClick={() => handleDelete(variantType)} title={(variantType.variants_count ?? 0) > 0 ? 'Used by products' : 'Delete'} type="button"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td className="px-5 py-8 text-center font-semibold text-slate-500" colSpan="4">No variant types found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  )
}
