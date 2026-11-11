import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Scroll reveal for elements marked with `.reveal`. One shared observer,
 * skipped entirely when the visitor prefers reduced motion.
 */
export function useReveal(): void {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = () => Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.reveal-in)'))
    if (reduce) {
      nodes().forEach((el) => el.classList.add('reveal-in'))
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            observer?.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const attach = () => nodes().forEach((el) => observer?.observe(el))
    attach()
    // late-rendered content (async pages) gets picked up on the next tick
    window.setTimeout(attach, 400)
    window.setTimeout(attach, 1200)
  })

  onBeforeUnmount(() => observer?.disconnect())
}
