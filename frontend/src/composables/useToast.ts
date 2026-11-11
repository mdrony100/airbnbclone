import { ref } from 'vue'

export interface ToastItem { id: number; message: string }

const items = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function push(message: string, ms = 2400): void {
    const id = ++seq
    items.value = [...items.value, { id, message }]
    window.setTimeout(() => {
      items.value = items.value.filter((t) => t.id !== id)
    }, ms)
  }
  return { items, push }
}
