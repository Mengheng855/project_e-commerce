import { uploadBannerImages } from '../api/bannerApi'

export async function prepareBannerPayload(values) {
  const { foreground_image_file = null, image_file = null, ...payload } = values

  if (image_file) {
    const [uploadedImage] = await uploadBannerImages([image_file])
    payload.image = uploadedImage?.image ?? payload.image
  }

  if (foreground_image_file) {
    const [uploadedForegroundImage] = await uploadBannerImages([foreground_image_file])
    payload.foreground_image = uploadedForegroundImage?.image ?? payload.foreground_image
  }

  if (!payload.foreground_image) {
    payload.foreground_image = null
  }

  return payload
}
