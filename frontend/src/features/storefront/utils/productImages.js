import { assetUrl } from '../../../shared/utils/assetUrl'

export function getProductImages(product) {
  return [...(product.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(normalizeProductImage)
}

export function getProductImage(product) {
  const images = getProductImages(product)

  return images.find((image) => image.is_primary) ?? images[0] ?? null
}

export function getProductHoverImage(product) {
  const images = getProductImages(product)
  const primaryImage = getProductImage(product)

  return images.find((image) => (image.id ?? image.image) !== (primaryImage?.id ?? primaryImage?.image)) ?? null
}

export function normalizeProductImage(image) {
  return image ? { ...image, image: assetUrl(image.image) } : image
}
