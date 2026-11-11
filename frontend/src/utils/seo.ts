/** Keeps the document title and social preview tags in step with the route. */
export function updateMeta(title: string, description: string, image?: string): void {
  document.title = title

  const tag = (selector: string, attrs: Record<string, string>): HTMLMetaElement => {
    let el = document.head.querySelector<HTMLMetaElement>(selector)
    if (!el) {
      el = document.createElement('meta')
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
      document.head.appendChild(el)
    }
    return el
  }

  tag('meta[name="description"]', { name: 'description' }).setAttribute('content', description)
  tag('meta[property="og:title"]', { property: 'og:title' }).setAttribute('content', title)
  tag('meta[property="og:description"]', { property: 'og:description' }).setAttribute('content', description)
  tag('meta[name="twitter:card"]', { name: 'twitter:card' }).setAttribute('content', 'summary_large_image')

  if (image) {
    tag('meta[property="og:image"]', { property: 'og:image' }).setAttribute('content', image)
    tag('meta[name="twitter:image"]', { name: 'twitter:image' }).setAttribute('content', image)
  }
}
