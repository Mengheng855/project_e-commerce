import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { assetUrl } from '../../../shared/utils/assetUrl'

export function LogoForm({ initialValues = null, isLoading = false, onSubmit }) {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [values, setValues] = useState({ title: '', image: '', is_active: true })
  const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  useEffect(() => { if (!initialValues) return; setValues({ title: initialValues.title ?? '', image: initialValues.image ?? '', is_active: Boolean(initialValues.is_active) }); setFile(null) }, [initialValues])
  function selectFile(files) { const selected = Array.from(files).find((item) => item.type.startsWith('image/')); if (selected) setFile(selected) }
  function handleSubmit(event) { event.preventDefault(); onSubmit({ title: values.title || null, image: values.image, image_file: file, is_active: values.is_active }) }
  const image = preview || assetUrl(values.image)
  return <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
    <label className="grid gap-2 text-sm font-bold text-slate-700">Logo title<Input maxLength="100" name="title" onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} placeholder="Main logo" value={values.title} /></label>
    <div className="grid gap-2 text-sm font-bold text-slate-700">Logo image<label className={(isDragging ? 'border-teal-800 bg-teal-50 ' : 'border-slate-300 bg-white hover:border-teal-800 hover:bg-teal-50 ') + 'grid min-h-44 cursor-pointer place-items-center rounded-lg border-2 border-dashed p-5 text-center text-slate-600'} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setIsDragging(false); selectFile(e.dataTransfer.files) }}><input accept="image/*" className="sr-only" onChange={(e) => { selectFile(e.target.files ?? []); e.target.value = '' }} required={!values.image && !file} type="file" /><span>Click to choose logo, or drag and drop it here.<span className="mt-1 block text-xs font-semibold text-slate-500">Recommended: PNG/SVG/WebP, transparent background, under 4 MB.</span></span></label>{image ? <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-3"><img alt="Logo preview" className="h-28 w-full rounded-md object-contain" src={image} />{file ? <button className="mt-2 rounded-md border border-red-200 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-50" onClick={() => setFile(null)} type="button">Remove selected image</button> : null}</div> : null}</div>
    <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} type="checkbox" /> Active</label>
    <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">{isLoading ? 'Saving...' : 'Save logo'}</Button>
  </form>
}
