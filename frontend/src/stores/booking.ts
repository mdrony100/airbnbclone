import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Booking, GuestDetails } from '@/types'

export interface Draft {
  propertySlug: string
  checkIn: string
  checkOut: string
  guests: number
}

export const useBookingStore = defineStore('booking', () => {
  const draft = ref<Draft | null>(null)
  const guest = ref<GuestDetails>({ firstName: '', lastName: '', email: '', phone: '', message: '' })
  const current = ref<Booking | null>(null)

  function setDraft(next: Draft): void { draft.value = next }
  function setGuest(next: Partial<GuestDetails>): void { guest.value = { ...guest.value, ...next } }
  function clear(): void { draft.value = null; current.value = null }

  return { draft, guest, current, setDraft, setGuest, clear }
})
