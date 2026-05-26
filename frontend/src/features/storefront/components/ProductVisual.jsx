import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { getProductHoverImage, getProductImage, getProductImages } from '../utils/productImages'

function visualImageKey(image) {
  return String(image?.id ?? image?.image ?? '')
}

export function ProductVisual({ product, size = 'md', image = null, hoverImage = null, hoverSwap = false }) {
  const sizeClass = size === 'lg' ? 'h-64 text-7xl' : 'h-44 text-5xl'
  const [failedImageKeys, setFailedImageKeys] = useState([])
  const [hoverImageFailed, setHoverImageFailed] = useState(false)
  const failedImageSet = new Set(failedImageKeys)
  const imageCandidates = useMemo(() => {
    const galleryImages = getProductImages(product)
    const fallbackImage = product.image ? [{ image: product.image, alt_text: product.name }] : []
    return image ? [image] : [...galleryImages, ...fallbackImage]
  }, [image, product])
  const selectedImage = imageCandidates.find((candidate) => !failedImageSet.has(visualImageKey(candidate))) ?? null
  const selectedHoverImage = hoverImage ?? getProductHoverImage(product)
  const imageSrc = assetUrl(selectedImage?.image)
  const imageAlt = selectedImage?.alt_text ?? product.name
  const hoverImageSrc = hoverSwap ? assetUrl(selectedHoverImage?.image) : null
  const hoverImageAlt = selectedHoverImage?.alt_text ?? product.name
  const fallbackText = product.category?.name?.slice(0, 2).toUpperCase() ?? 'TT'

  useEffect(() => {
    setFailedImageKeys([])
  }, [product?.id, product?.slug])

  useEffect(() => {
    setHoverImageFailed(false)
  }, [imageSrc, hoverImageSrc])

  if (!imageSrc) {
    return (
      <div className={sizeClass + ' flex w-full items-center justify-center rounded-md border border-teal-900/15 bg-gradient-to-br from-teal-800 to-teal-950 font-black text-white'}>
        {fallbackText}
      </div>
    )
  }

  return (
    <div className={sizeClass + ' relative w-full overflow-hidden rounded-md border border-teal-900/15 bg-slate-100'}>
      <img
        alt={imageAlt}
        className={(hoverImageSrc && !hoverImageFailed ? 'group-hover:opacity-0 ' : '') + 'h-full w-full object-cover transition duration-300'}
        loading="lazy"
        onError={() => setFailedImageKeys((current) => [...new Set([...current, visualImageKey(selectedImage)])])}
        src={imageSrc}
      />
      {hoverImageSrc && !hoverImageFailed ? (
        <img
          alt={hoverImageAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100"
          onError={() => setHoverImageFailed(true)}
          src={hoverImageSrc}
        />
      ) : null}
    </div>
  )
}
