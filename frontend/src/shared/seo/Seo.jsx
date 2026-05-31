import { useEffect } from 'react'
import { seoConfig } from './config'

function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path
  return seoConfig.siteUrl + (path.startsWith('/') ? path : '/' + path)
}

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export function Seo({
  canonical = '/',
  description = seoConfig.defaultDescription,
  image = '/logo.png',
  jsonLd = null,
  robots = 'index, follow',
  title = seoConfig.siteName,
  type = 'website',
}) {
  useEffect(() => {
    const fullTitle = title === seoConfig.siteName ? seoConfig.siteName : title + ' | ' + seoConfig.siteName
    const canonicalUrl = absoluteUrl(canonical)
    const imageUrl = absoluteUrl(image)

    document.title = fullTitle
    document.documentElement.lang = 'en'

    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[name="robots"]', { name: 'robots', content: robots })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: seoConfig.siteName })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
    setLink('canonical', canonicalUrl)

    document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((element) => element.remove())

    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.seoJsonld = 'true'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [canonical, description, image, jsonLd, robots, title, type])

  return null
}
