import { ref } from 'vue'

export type ToastTone = 'info' | 'error' | 'success'
export interface ToastItem { id: number; message: string; tone: ToastTone }

const items = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function push(message: string, toneOrMs: ToastTone | number = 'info', ms = 2600): void {
    const tone: ToastTone = typeof toneOrMs === 'number' ? 'info' : toneOrMs
    const life = typeof toneOrMs === 'number' ? toneOrMs : ms
    const id = ++seq
    items.value = [...items.value, { id, message, tone }]
    window.setTimeout(() => {
      items.value = items.value.filter((t) => t.id !== id)
    }, life)
  }
  return { items, push }
}
