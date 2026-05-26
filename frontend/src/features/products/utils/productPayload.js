import { uploadProductImages } from '../api/productApi'

export async function prepareProductPayload(values) {
  const { gallery_files = [], main_image_file = null, ...payload } = values
  const galleryFiles = Array.from(gallery_files)
  let mainImage = payload.image || null
  const images = []

  if (main_image_file) {
    const [uploadedMainImage] = await uploadProductImages([main_image_file])
    mainImage = uploadedMainImage?.image ?? mainImage
  }

  if (mainImage) {
    payload.image = mainImage
  } else {
    delete payload.image
  }

  if (main_image_file || galleryFiles.length > 0) {
    if (mainImage) {
      images.push({
        image: mainImage,
        alt_text: payload.name,
        is_primary: true,
        order: 0,
      })
    }

    if (galleryFiles.length > 0) {
      const uploadedGalleryImages = await uploadProductImages(galleryFiles)
      uploadedGalleryImages.forEach((uploadedImage) => {
        images.push({
          image: uploadedImage.image,
          alt_text: payload.name,
          is_primary: images.length === 0,
          order: images.length,
        })
      })
    }

    payload.images = images
  }

  return payload
}
