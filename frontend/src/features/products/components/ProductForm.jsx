import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { Input } from '../../../shared/components/Input'
import { ScrollableTable } from '../../../shared/components/ScrollableTable'

function fileKey(file) {
  return [file.name, file.size, file.lastModified].join('-')
}

function createClientId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return 'client-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
}

const variantPresets = [
  {
    label: 'RAM 2/4/8/16GB',
    type: 'RAM',
    values: ['2GB', '4GB', '8GB', '16GB'],
  },
  {
    label: 'Storage sizes',
    type: 'Storage',
    values: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  },
  {
    label: 'CPU options',
    type: 'CPU',
    values: ['Intel i3', 'Intel i5', 'Intel i7', 'Ryzen 5', 'Ryzen 7'],
  },
  {
    label: 'Colors',
    type: 'Color',
    values: [
      { value: 'Black', color_hex: '#111111' },
      { value: 'Silver', color_hex: '#c0c0c0' },
      { value: 'White', color_hex: '#ffffff' },
      { value: 'Orange', color_hex: '#f97316' },
    ],
  },
]

function createEmptyVariant() {
  return {
    id: createClientId(),
    variant_type_id: '',
    variant_type_name: '',
    value: '',
    color_hex: '',
    price_modifier: 0,
    stock: 0,
    is_active: true,
  }
}

function createEmptySpecification() {
  return {
    id: createClientId(),
    key: '',
    value: '',
  }
}

const specificationPresets = ['CPU', 'RAM', 'GPU', 'Display', 'Battery', 'Camera', 'OS', 'Warranty', 'Weight', 'Ports']

function getVariantTypeName(variant, variantTypes) {
  if (variant.variant_type_name) return variant.variant_type_name

  return variantTypes.find((variantType) => String(variantType.id) === String(variant.variant_type_id))?.name ?? ''
}

function isColorVariant(variant, variantTypes) {
  return getVariantTypeName(variant, variantTypes).trim().toLowerCase() === 'color'
}

function getVariantGroupKey(variant, variantTypes) {
  const typeName = getVariantTypeName(variant, variantTypes).trim().toLowerCase()

  return typeName ? 'type:' + typeName : 'empty:' + variant.id
}

function uniqueVariantsForSubmit(variants, variantTypes) {
  const seenKeys = new Set()

  return variants.filter((variant) => {
    const typeKey = variant.variant_type_id ? 'id:' + variant.variant_type_id : 'name:' + getVariantTypeName(variant, variantTypes).trim().toLowerCase()
    const valueKey = variant.value.trim().toLowerCase()

    if (!typeKey || !valueKey) return true

    const key = typeKey + '|' + valueKey
    if (seenKeys.has(key)) return false

    seenKeys.add(key)
    return true
  })
}

function groupVariantRows(variants, variantTypes) {
  return variants.reduce((groups, variant) => {
    const key = getVariantGroupKey(variant, variantTypes)
    const existingGroup = groups.find((group) => group.key === key)

    if (existingGroup) {
      existingGroup.items.push(variant)
    } else {
      groups.push({
        key,
        typeName: getVariantTypeName(variant, variantTypes),
        variant_type_id: variant.variant_type_id,
        variant_type_name: variant.variant_type_name,
        items: [variant],
      })
    }

    return groups
  }, [])
}

export function ProductForm({ brands = [], categories = [], initialValues = null, isLoading = false, onSubmit, variantTypes = [] }) {
  const [values, setValues] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock: 0,
    image: '',
    category_id: '',
    brand_id: '',
    is_active: true,
    is_featured: false,
  })
  const [galleryFiles, setGalleryFiles] = useState([])
  const [isGalleryDragging, setIsGalleryDragging] = useState(false)
  const [isMainImageDragging, setIsMainImageDragging] = useState(false)
  const [mainImageFile, setMainImageFile] = useState(null)
  const [specifications, setSpecifications] = useState([])
  const [variants, setVariants] = useState([])

  const existingImages = useMemo(() => {
    return [...(initialValues?.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [initialValues])

  const mainImagePreview = useMemo(() => {
    return mainImageFile ? URL.createObjectURL(mainImageFile) : null
  }, [mainImageFile])

  const galleryPreviews = useMemo(() => {
    return galleryFiles.map((file) => ({ file, key: fileKey(file), url: URL.createObjectURL(file) }))
  }, [galleryFiles])

  const variantGroups = useMemo(() => groupVariantRows(variants, variantTypes), [variantTypes, variants])

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview)
    }
  }, [mainImagePreview])

  useEffect(() => {
    return () => galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [galleryPreviews])

  useEffect(() => {
    if (!initialValues) {
      return
    }

    setValues({
      name: initialValues.name ?? '',
      description: initialValues.description ?? '',
      price: initialValues.price ?? '',
      original_price: initialValues.original_price ?? '',
      stock: initialValues.stock ?? 0,
      image: initialValues.image ?? '',
      category_id: initialValues.category?.id ?? '',
      brand_id: initialValues.brand?.id ?? '',
      is_active: Boolean(initialValues.is_active),
      is_featured: Boolean(initialValues.is_featured),
    })
    setSpecifications((initialValues.specifications ?? []).map((specification) => ({
      id: String(specification.id ?? createClientId()),
      key: specification.key ?? '',
      value: specification.value ?? '',
    })))
    setVariants((initialValues.variants ?? []).map((variant) => ({
      id: String(variant.id ?? createClientId()),
      variant_type_id: variant.variant_type_id ? String(variant.variant_type_id) : '',
      variant_type_name: variant.variant_type?.name ?? '',
      value: variant.value ?? '',
      color_hex: variant.color_hex ?? '',
      price_modifier: variant.price_modifier ?? 0,
      stock: variant.stock ?? 0,
      is_active: Boolean(variant.is_active),
    })))
    setGalleryFiles([])
    setMainImageFile(null)
  }, [initialValues])

  function selectMainImage(files) {
    const imageFile = Array.from(files).find((file) => file.type.startsWith('image/'))

    if (imageFile) {
      setMainImageFile(imageFile)
    }
  }

  function addGalleryFiles(files) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))

    setGalleryFiles((currentFiles) => {
      const selectedKeys = new Set(currentFiles.map(fileKey))
      const nextFiles = [...currentFiles]

      imageFiles.forEach((file) => {
        const key = fileKey(file)
        if (!selectedKeys.has(key)) {
          selectedKeys.add(key)
          nextFiles.push(file)
        }
      })

      return nextFiles
    })
  }

  function handleChange(event) {
    const { checked, name, type, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: type === 'checkbox' ? checked : value }))
  }

  function addVariantPreset(preset) {
    const existingType = variantTypes.find((variantType) => variantType.name.toLowerCase() === preset.type.toLowerCase())

    setVariants((currentVariants) => {
      const existingKeys = new Set(currentVariants.map((variant) => [getVariantTypeName(variant, variantTypes).toLowerCase(), variant.value.toLowerCase()].join(':')))
      const nextVariants = [...currentVariants]

      preset.values.forEach((item) => {
        const value = typeof item === 'string' ? item : item.value
        const key = [preset.type.toLowerCase(), value.toLowerCase()].join(':')

        if (!existingKeys.has(key)) {
          existingKeys.add(key)
          nextVariants.push({
            ...createEmptyVariant(),
            variant_type_id: existingType ? String(existingType.id) : '',
            variant_type_name: existingType ? existingType.name : preset.type,
            value,
            color_hex: typeof item === 'string' ? '' : item.color_hex,
            stock: values.stock || 0,
          })
        }
      })

      return nextVariants
    })
  }

  function handleSpecificationChange(id, field, value) {
    setSpecifications((currentSpecifications) => currentSpecifications.map((specification) => (
      specification.id === id ? { ...specification, [field]: value } : specification
    )))
  }

  function addSpecification(key = '') {
    setSpecifications((currentSpecifications) => [
      ...currentSpecifications,
      { ...createEmptySpecification(), key },
    ])
  }

  function handleVariantGroupTypeChange(groupKey, field, value) {
    setVariants((currentVariants) => currentVariants.map((variant) => {
      if (getVariantGroupKey(variant, variantTypes) !== groupKey) return variant

      const nextVariant = { ...variant, [field]: value }
      if (field === 'variant_type_id') {
        const selectedType = variantTypes.find((variantType) => String(variantType.id) === String(value))
        nextVariant.variant_type_name = selectedType?.name ?? ''
      }

      return nextVariant
    }))
  }

  function addVariantToGroup(group) {
    setVariants((currentVariants) => [
      ...currentVariants,
      {
        ...createEmptyVariant(),
        variant_type_id: group.variant_type_id,
        variant_type_name: group.variant_type_name || group.typeName,
        stock: values.stock || 0,
      },
    ])
  }

  function handleVariantChange(id, field, value) {
    setVariants((currentVariants) => currentVariants.map((variant) => {
      if (variant.id !== id) return variant

      const nextVariant = { ...variant, [field]: value }
      if (field === 'variant_type_id') {
        const selectedType = variantTypes.find((variantType) => String(variantType.id) === String(value))
        nextVariant.variant_type_name = selectedType?.name ?? ''
      }

      return nextVariant
    }))
  }

  function handleGalleryDrop(event) {
    event.preventDefault()
    setIsGalleryDragging(false)
    addGalleryFiles(event.dataTransfer.files)
  }

  function handleMainImageDrop(event) {
    event.preventDefault()
    setIsMainImageDragging(false)
    selectMainImage(event.dataTransfer.files)
  }

  function handleSubmit(event) {
    event.preventDefault()

    onSubmit({
      name: values.name,
      description: values.description || null,
      price: Number(values.price),
      original_price: values.original_price === '' ? null : Number(values.original_price),
      stock: Number(values.stock),
      image: values.image || null,
      main_image_file: mainImageFile,
      gallery_files: galleryFiles,
      category_id: Number(values.category_id),
      brand_id: values.brand_id ? Number(values.brand_id) : null,
      is_active: values.is_active,
      is_featured: values.is_featured,
      specifications: specifications
        .filter((specification) => specification.key.trim() && specification.value.trim())
        .map((specification, index) => ({
          key: specification.key.trim(),
          value: specification.value.trim(),
          order: index,
        })),
      variants: uniqueVariantsForSubmit(variants, variantTypes)
        .filter((variant) => (variant.variant_type_id || variant.variant_type_name.trim()) && variant.value.trim())
        .map((variant) => ({
          variant_type_id: variant.variant_type_id ? Number(variant.variant_type_id) : null,
          variant_type_name: variant.variant_type_id ? null : variant.variant_type_name.trim(),
          value: variant.value.trim(),
          color_hex: isColorVariant(variant, variantTypes) ? (variant.color_hex || null) : null,
          price_modifier: Number(variant.price_modifier || 0),
          stock: Number(variant.stock || 0),
          is_active: variant.is_active,
        })),
    })
  }

  return (
    <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Product name
          <Input name="name" onChange={handleChange} required value={values.name} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Price
          <Input min="0" name="price" onChange={handleChange} required step="0.01" type="number" value={values.price} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Original price
          <Input min="0" name="original_price" onChange={handleChange} step="0.01" type="number" value={values.original_price ?? ''} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Stock
          <Input min="0" name="stock" onChange={handleChange} required type="number" value={values.stock} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Category
          <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="category_id" onChange={handleChange} required value={values.category_id}>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Brand
          <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="brand_id" onChange={handleChange} value={values.brand_id}>
            <option value="">No brand</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2 text-sm font-bold text-slate-700">
          Main image
          <label className={['grid min-h-36 cursor-pointer place-items-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition', isMainImageDragging ? 'border-teal-800 bg-teal-50 text-teal-900' : 'border-slate-300 bg-white text-slate-600 hover:border-teal-800 hover:bg-teal-50'].join(' ')} onDragEnter={(event) => { event.preventDefault(); setIsMainImageDragging(true) }} onDragLeave={(event) => { event.preventDefault(); setIsMainImageDragging(false) }} onDragOver={(event) => event.preventDefault()} onDrop={handleMainImageDrop}>
            <input accept="image/*" className="sr-only" onChange={(event) => { selectMainImage(event.target.files ?? []); event.target.value = '' }} type="file" />
            <span>Click to choose main image, or drag and drop it here.<span className="mt-1 block text-xs font-semibold text-slate-500">Only one main image is used for the product card.</span></span>
          </label>
        </div>

        <div className="grid gap-2 text-sm font-bold text-slate-700">
          Gallery images
          <label className={['grid min-h-36 cursor-pointer place-items-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition', isGalleryDragging ? 'border-teal-800 bg-teal-50 text-teal-900' : 'border-slate-300 bg-white text-slate-600 hover:border-teal-800 hover:bg-teal-50'].join(' ')} onDragEnter={(event) => { event.preventDefault(); setIsGalleryDragging(true) }} onDragLeave={(event) => { event.preventDefault(); setIsGalleryDragging(false) }} onDragOver={(event) => event.preventDefault()} onDrop={handleGalleryDrop}>
            <input accept="image/*" className="sr-only" multiple onChange={(event) => { addGalleryFiles(event.target.files ?? []); event.target.value = '' }} type="file" />
            <span>Click to choose images, or drag and drop them here.<span className="mt-1 block text-xs font-semibold text-slate-500">You can choose files again to add more before saving.</span></span>
          </label>
        </div>
      </div>

      {(mainImagePreview || (!mainImageFile && values.image)) ? (
        <div className="grid gap-2">
          <p className="text-sm font-bold text-slate-700">Main image preview</p>
          <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-2">
            <img alt="Main product" className="h-40 w-full rounded-md object-cover" src={mainImagePreview || assetUrl(values.image)} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-xs font-semibold text-slate-500">{mainImageFile ? mainImageFile.name : 'Current main image'}</span>
              {mainImageFile ? <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50" onClick={() => setMainImageFile(null)} type="button">Remove</button> : null}
            </div>
          </div>
        </div>
      ) : null}

      {galleryPreviews.length > 0 ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-700">Selected gallery ({galleryPreviews.length})</p>
            <button className="text-sm font-bold text-teal-800 hover:text-teal-950" onClick={() => setGalleryFiles([])} type="button">Clear all</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleryPreviews.map((preview, index) => (
              <div className="rounded-lg border border-slate-200 bg-white p-2" key={preview.key}>
                <img alt={preview.file.name} className="h-28 w-full rounded-md object-cover" src={preview.url} />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-slate-500">{index + 1}. {preview.file.name}</span>
                  <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50" onClick={() => setGalleryFiles((files) => files.filter((file) => fileKey(file) !== preview.key))} type="button">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {existingImages.length > 0 && galleryFiles.length === 0 ? (
        <div className="grid gap-2">
          <p className="text-sm font-bold text-slate-700">Current gallery</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((image) => <img alt={image.alt_text ?? values.name} className="h-20 w-24 rounded-md border border-slate-200 object-cover" key={image.id ?? image.image} src={assetUrl(image.image)} />)}
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Specifications</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Fixed product details like CPU, RAM, display, battery, warranty, and more.</p>
          </div>
          <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" onClick={() => addSpecification()} type="button">
            Add spec
          </Button>
        </div>

        <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Quick add specs</p>
          <div className="flex flex-wrap gap-2">
            {specificationPresets.map((preset) => (
              <button
                className="rounded-md border border-teal-800 px-3 py-2 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white"
                key={preset}
                onClick={() => addSpecification(preset)}
                type="button"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {specifications.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-sm font-semibold text-slate-500">No specifications yet. Add fixed product info here; keep customer choices in variants.</p> : null}

        {specifications.length ? (
          <div className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
            <ScrollableTable>
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Spec</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {specifications.map((specification) => (
                    <tr key={specification.id}>
                      <td className="px-4 py-3 align-top">
                        <Input maxLength="100" onChange={(event) => handleSpecificationChange(specification.id, 'key', event.target.value)} placeholder="CPU" value={specification.key} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Input onChange={(event) => handleSpecificationChange(specification.id, 'value', event.target.value)} placeholder="A19 Pro, 8GB, 6.9 inch" value={specification.value} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" onClick={() => setSpecifications((currentSpecifications) => currentSpecifications.filter((currentSpecification) => currentSpecification.id !== specification.id))} type="button">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Variants</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Add options like Color, Storage, RAM, Size, or Edition.</p>
          </div>
          <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" onClick={() => setVariants((currentVariants) => [...currentVariants, createEmptyVariant()])} type="button">
            Add variant
          </Button>
        </div>

        <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Quick add variants</p>
          <div className="flex flex-wrap gap-2">
            {variantPresets.map((preset) => (
              <button
                className="rounded-md border border-teal-800 px-3 py-2 text-sm font-black text-teal-900 hover:bg-teal-800 hover:text-white"
                key={preset.label}
                onClick={() => addVariantPreset(preset)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {variants.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-sm font-semibold text-slate-500">No variants yet. Use Quick add or click Add variant if this product has options.</p> : null}

        {variantGroups.map((group, groupIndex) => {
          const sampleVariant = group.items[0] ?? createEmptyVariant()
          const isColorGroup = isColorVariant(sampleVariant, variantTypes)

          return (
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4" key={group.key}>
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-black text-slate-700">Variant group {groupIndex + 1}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Choose the type once, then add only the values customers can pick.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md border border-teal-800 px-3 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white" onClick={() => addVariantToGroup(group)} type="button">Add value</button>
                  <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" onClick={() => setVariants((currentVariants) => currentVariants.filter((variant) => getVariantGroupKey(variant, variantTypes) !== group.key))} type="button">Remove group</button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Variant type
                  <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" onChange={(event) => handleVariantGroupTypeChange(group.key, 'variant_type_id', event.target.value)} value={group.variant_type_id}>
                    <option value="">New type below</option>
                    {variantTypes.map((variantType) => <option key={variantType.id} value={variantType.id}>{variantType.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  New type name
                  <Input disabled={Boolean(group.variant_type_id)} maxLength="50" onChange={(event) => handleVariantGroupTypeChange(group.key, 'variant_type_name', event.target.value)} placeholder="Color, Storage, RAM" value={group.variant_type_name} />
                </label>
              </div>

              <div className="max-w-full overflow-hidden rounded-lg border border-slate-200">
                <ScrollableTable>
                  <table className="w-full min-w-[1120px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Value</th>
                        {isColorGroup ? <th className="px-4 py-3">Color</th> : null}
                        <th className="px-4 py-3">Price modifier</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.items.map((variant) => (
                        <tr key={variant.id}>
                          <td className="px-4 py-3">
                            <Input maxLength="100" onChange={(event) => handleVariantChange(variant.id, 'value', event.target.value)} placeholder="2GB, 16GB, Orange" required value={variant.value} />
                          </td>
                          {isColorGroup ? (
                            <td className="px-4 py-3">
                              <Input maxLength="7" onChange={(event) => handleVariantChange(variant.id, 'color_hex', event.target.value)} placeholder="#000000" value={variant.color_hex} />
                            </td>
                          ) : null}
                          <td className="px-4 py-3">
                            <Input onChange={(event) => handleVariantChange(variant.id, 'price_modifier', event.target.value)} step="0.01" type="number" value={variant.price_modifier} />
                          </td>
                          <td className="px-4 py-3">
                            <Input min="0" onChange={(event) => handleVariantChange(variant.id, 'stock', event.target.value)} type="number" value={variant.stock} />
                          </td>
                          <td className="px-4 py-3">
                            <input checked={variant.is_active} onChange={(event) => handleVariantChange(variant.id, 'is_active', event.target.checked)} type="checkbox" />
                          </td>
                          <td className="px-4 py-3">
                            <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" onClick={() => setVariants((currentVariants) => currentVariants.filter((currentVariant) => currentVariant.id !== variant.id))} type="button">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollableTable>
              </div>
            </div>
          )
        })}
      </section>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Description
        <textarea className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20" name="description" onChange={handleChange} value={values.description} />
      </label>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input checked={values.is_active} name="is_active" onChange={handleChange} type="checkbox" /> Active</label>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input checked={values.is_featured} name="is_featured" onChange={handleChange} type="checkbox" /> Featured</label>
      </div>

      <Button className="w-fit bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">
        {isLoading ? 'Saving...' : 'Save product'}
      </Button>
    </form>
  )
}
