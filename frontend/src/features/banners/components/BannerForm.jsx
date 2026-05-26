import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'

function ImageDropField({ currentImage = '', file, label, note, onChange, required = false }) {
  const [isDragging, setIsDragging] = useState(false)
  const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function selectFile(files) {
    const imageFile = Array.from(files).find((selectedFile) => selectedFile.type.startsWith('image/'))
    if (imageFile) onChange(imageFile)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files)
  }

  return (
    <div className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <label
        className={[
          'grid min-h-36 cursor-pointer place-items-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition',
          isDragging ? 'border-teal-800 bg-teal-50 text-teal-900' : 'border-slate-300 bg-white text-slate-600 hover:border-teal-800 hover:bg-teal-50',
        ].join(' ')}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            selectFile(event.target.files ?? [])
            event.target.value = ''
          }}
          required={required && !currentImage && !file}
          type="file"
        />
        <span>
          Click to choose image, or drag and drop it here.
          <span className="mt-1 block text-xs font-semibold text-slate-500">{note}</span>
        </span>
      </label>

      {(preview || currentImage) ? (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-2">
          <img alt={label} className="h-40 w-full rounded-md object-cover" src={preview || currentImage} />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold text-slate-500">{file ? file.name : 'Current image'}</span>
            {file ? <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50" onClick={() => onChange(null)} type="button">Remove</button> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function BannerForm({ initialValues = null, isLoading = false, onSubmit }) {
  const [values, setValues] = useState({
    title: '',
    text: '',
    image: '',
    foreground_image: '',
    is_active: true,
    sort_order: 0,
  })
  const [foregroundImageFile, setForegroundImageFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (!initialValues) return

    setValues({
      title: initialValues.title ?? '',
      text: initialValues.text ?? '',
      image: initialValues.image ?? '',
      foreground_image: initialValues.foreground_image ?? '',
      is_active: Boolean(initialValues.is_active),
      sort_order: initialValues.sort_order ?? 0,
    })
    setForegroundImageFile(null)
    setImageFile(null)
  }, [initialValues])

  function handleChange(event) {
    const { checked, name, type, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      title: values.title || null,
      text: values.text || null,
      image: values.image,
      image_file: imageFile,
      foreground_image: values.foreground_image || null,
      foreground_image_file: foregroundImageFile,
      is_active: values.is_active,
      sort_order: Number(values.sort_order),
    })
  }

  return (
    <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Hero title
        <Input maxLength="160" name="title" onChange={handleChange} placeholder="Example: Computers, phones, and clean tech essentials." value={values.title} />
      </label>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Banner text
        <Input maxLength="500" name="text" onChange={handleChange} required value={values.text} />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <ImageDropField
          currentImage={values.image}
          file={imageFile}
          label="Main image"
          note="Required. Recommended size: 1920 x 700 px, JPG/WebP under 4 MB."
          onChange={setImageFile}
          required
        />
        <ImageDropField
          currentImage={values.foreground_image}
          file={foregroundImageFile}
          label="Foreground image"
          note="Optional. Recommended size: 900 x 600 px, PNG/WebP under 4 MB."
          onChange={setForegroundImageFile}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Sort order
          <Input
            min="0"
            name="sort_order"
            onChange={handleChange}
            type="number"
            value={values.sort_order}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input
            checked={values.is_active}
            name="is_active"
            onChange={handleChange}
            type="checkbox"
          />
          Active
        </label>
      </div>

      <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">
        {isLoading ? 'Saving...' : 'Save banner'}
      </Button>
    </form>
  )
}
