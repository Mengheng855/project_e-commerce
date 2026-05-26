import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { addCartItem } from '../../cart/api/cartApi'
import { getProductImage } from '../utils/productImages'

function groupVariants(variants = []) {
  return variants
    .filter((variant) => variant.is_active)
    .reduce((groups, variant) => {
      const typeName = variant.variant_type?.name ?? 'Option'
      const existingGroup = groups.find((group) => group.name === typeName)

      if (existingGroup) {
        existingGroup.items.push(variant)
      } else {
        groups.push({ name: typeName, items: [variant] })
      }

      return groups
    }, [])
}

function isColorGroup(name) {
  return name.trim().toLowerCase() === 'color'
}

function imageKey(image) {
  return String(image?.id ?? image?.image ?? '')
}

function ProductImage({ alt, className, fallbackText = 'TT', onImageError = null, src }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return (
      <div className={className + ' flex items-center justify-center bg-gradient-to-br from-teal-800 to-teal-950 font-black text-white'}>
        {fallbackText}
      </div>
    )
  }

  return (
    <div className={className + ' relative overflow-hidden bg-slate-100'}>
      <img
        alt={alt}
        className="h-full w-full object-contain"
        loading="lazy"
        onError={() => {
          setHasError(true)
          onImageError?.()
        }}
        src={src}
      />
    </div>
  )
}

export function ProductDetail({ product }) {
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(null)
  const [failedImageKeys, setFailedImageKeys] = useState([])
  const [selectedVariants, setSelectedVariants] = useState({})
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const galleryImages = useMemo(() => {
    const images = product?.images ?? []
    return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [product])

  const variantGroups = useMemo(() => groupVariants(product?.variants), [product?.variants])
  const specifications = useMemo(() => [...(product?.specifications ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [product?.specifications])

  useEffect(() => {
    setActiveImage(null)
    setFailedImageKeys([])
    setSelectedVariants({})
    setCartMessage('')
    setCartError('')
  }, [product?.slug])

  if (!product) {
    return null
  }

  const failedImageSet = new Set(failedImageKeys)
  const primaryImage = getProductImage(product)
  const galleryCandidates = galleryImages.length ? galleryImages : (product.image ? [{ image: product.image, alt_text: product.name, is_primary: true, order: 0 }] : [])
  const selectedImage = activeImage && !failedImageSet.has(imageKey(activeImage))
    ? activeImage
    : galleryCandidates.find((image) => !failedImageSet.has(imageKey(image))) ?? primaryImage
  const selectedVariantList = variantGroups
    .map((group) => selectedVariants[group.name])
    .filter(Boolean)
  const missingVariantGroups = variantGroups.filter((group) => !selectedVariants[group.name])
  const allVariantsSelected = missingVariantGroups.length === 0
  const priceModifier = selectedVariantList.reduce((total, variant) => total + Number(variant.price_modifier ?? 0), 0)
  const displayPrice = Number(product.price) + priceModifier
  const selectedStock = selectedVariantList.length ? Math.min(...selectedVariantList.map((variant) => Number(variant.stock ?? 0))) : Number(product.stock ?? 0)
  const isReady = selectedStock > 0
  const canBuy = isReady && allVariantsSelected

  async function handleAddToCart() {
    if (!canBuy || isAddingToCart) return

    setCartError('')
    setCartMessage('')
    setIsAddingToCart(true)

    try {
      const cart = await addCartItem({
        product_id: product.id,
        qty: 1,
        selected_options: selectedVariantList.map((variant) => ({ variant_id: variant.id })),
      })
      setCartMessage('Added to cart. Cart now has ' + (cart?.items_count ?? 1) + ' item(s).')
    } catch (error) {
      if (error?.message === 'Unauthenticated.') {
        navigate('/login')
        return
      }

      const firstFieldError = error?.errors ? Object.values(error.errors).flat()[0] : null
      setCartError(firstFieldError ?? error?.message ?? 'Could not add this product to cart.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <section className="rounded-lg border border-teal-900/15 bg-white p-5 shadow-sm" id="product-detail">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-teal-900/15 bg-white">
            <ProductImage
              alt={selectedImage?.alt_text ?? product.name}
              className="h-[460px] w-full"
              fallbackText={product.category?.name?.slice(0, 2).toUpperCase() ?? 'TT'}
              onImageError={() => setFailedImageKeys((current) => [...new Set([...current, imageKey(selectedImage)])])}
              src={assetUrl(selectedImage?.image ?? product.image)}
            />
          </div>

          {galleryImages.length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {galleryImages.map((image) => {
                const isActive = (selectedImage?.id ?? selectedImage?.image) === (image.id ?? image.image)

                return (
                  <button
                    aria-label={image.alt_text ?? product.name}
                    className={
                      'h-20 overflow-hidden rounded-md border bg-white p-1 ' +
                      (isActive ? 'border-teal-800 ring-2 ring-teal-800/15' : 'border-teal-900/15 hover:border-teal-800/60')
                    }
                    key={image.id ?? image.image}
                    onClick={() => setActiveImage(image)}
                    type="button"
                  >
                    <ProductImage
                      alt={image.alt_text ?? product.name}
                      className="h-full w-full rounded text-sm"
                      fallbackText={product.category?.name?.slice(0, 2).toUpperCase() ?? 'TT'}
                      onImageError={() => setFailedImageKeys((current) => [...new Set([...current, imageKey(image)])])}
                      src={assetUrl(image.image)}
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wide text-teal-800">{product.brand?.name ?? 'TosTinh'}</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-teal-950">{product.name}</h2>
          <p className="mt-4 text-base font-medium leading-7 text-teal-900/75">{product.description || 'Clean electronics for daily work, study, and entertainment.'}</p>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <p className="text-4xl font-black text-teal-950">{formatCurrency(displayPrice)}</p>
            {product.original_price ? <p className="text-lg font-bold text-teal-900/60 line-through">{formatCurrency(product.original_price)}</p> : null}
            {priceModifier ? <p className="rounded-md bg-teal-50 px-2 py-1 text-xs font-black text-teal-700">Variant {priceModifier > 0 ? '+' : ''}{formatCurrency(priceModifier)}</p> : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-teal-900/15 p-3">
              <p className="text-xs font-bold uppercase text-teal-800">Category</p>
              <p className="mt-1 font-black text-teal-950">{product.category?.name ?? 'Electronics'}</p>
            </div>
            <div className="rounded-md border border-teal-900/15 p-3">
              <p className="text-xs font-bold uppercase text-teal-800">Stock</p>
              <p className="mt-1 font-black text-teal-950">{selectedStock}</p>
            </div>
            <div className="rounded-md border border-teal-900/15 p-3">
              <p className="text-xs font-bold uppercase text-teal-800">Status</p>
              <p className="mt-1 font-black text-teal-950">{isReady ? 'Ready' : 'Out of stock'}</p>
            </div>
          </div>

          {variantGroups.length ? (
            <div className="mt-6 grid gap-5 border-t border-teal-900/10 pt-5">
              {!allVariantsSelected ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                  Choose {missingVariantGroups.map((group) => group.name).join(', ')} before buying.
                </p>
              ) : null}
              {variantGroups.map((group) => (
                <div className="grid gap-2" key={group.name}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black uppercase tracking-wide text-teal-800">{group.name}</p>
                    {selectedVariants[group.name] ? <span className="text-sm font-bold text-teal-900/70">{selectedVariants[group.name].value}</span> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((variant) => {
                      const isSelected = selectedVariants[group.name]?.id === variant.id
                      const isColor = isColorGroup(group.name) && variant.color_hex

                      return (
                        <button
                          className={
                            (isSelected ? 'border-teal-800 bg-teal-800 text-white ' : 'border-teal-900/20 bg-white text-teal-950 hover:border-teal-800 ') +
                            'min-h-11 rounded-md border px-4 py-2 text-sm font-black'
                          }
                          key={variant.id}
                          onClick={() => setSelectedVariants((current) => ({ ...current, [group.name]: variant }))}
                          type="button"
                        >
                          <span className="inline-flex items-center gap-2">
                            {isColor ? <span className="h-4 w-4 rounded-full border border-white/70" style={{ backgroundColor: variant.color_hex }} /> : null}
                            {variant.value}
                            {Number(variant.price_modifier) ? <span className="text-xs opacity-80">+{formatCurrency(variant.price_modifier)}</span> : null}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {specifications.length ? (
            <div className="mt-6 border-t border-teal-900/10 pt-5">
              <p className="text-sm font-black uppercase tracking-wide text-teal-800">Specifications</p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {specifications.map((specification) => (
                  <div className="rounded-md border border-teal-900/15 p-3" key={specification.id ?? specification.key}>
                    <dt className="text-xs font-bold uppercase text-teal-800">{specification.key}</dt>
                    <dd className="mt-1 text-sm font-black text-teal-950">{specification.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 border-t border-teal-900/10 pt-5">
            {cartError ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{cartError}</p> : null}
            {cartMessage ? <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700">{cartMessage}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button className="h-12 rounded-md bg-teal-800 px-6 text-sm font-black text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60" disabled={!canBuy || isAddingToCart} onClick={handleAddToCart} type="button">
                {isAddingToCart ? 'Adding...' : 'Add to cart'}
              </button>
              <button className="h-12 rounded-md border border-teal-800 px-6 text-sm font-black text-teal-900 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={!canBuy} type="button">
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
