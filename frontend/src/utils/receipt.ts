import type { Reservation } from '@/types/dashboard'
import { money, dateLong } from './format'

/** Builds the demo receipt text. In milestone 3 this becomes a signed PDF from the API. */
export function receiptText(r: Reservation): string {
  const line = (label: string, value: string) => `${label.padEnd(26, '.')} ${value}`
  return [
    'STAYNEST — DEMO RECEIPT',
    '==========================',
    'This document is simulated prototype data.',
    '',
    line('Booking reference', r.reference),
    line('Reservation code', r.code),
    line('Property', r.propertyTitle),
    line('Location', `${r.city}, ${r.state}`),
    line('Check-in', dateLong(r.checkIn)),
    line('Check-out', dateLong(r.checkOut)),
    line('Nights', String(r.breakdown.nights)),
    line('Guests', String(r.guests)),
    line('Guest', r.guestName),
    line('Host', r.hostName),
    line('Status', r.status),
    '',
    'PAYMENT SUMMARY',
    '--------------------------',
    line(`${r.breakdown.nights} nights`, money(r.breakdown.nightly)),
    line('Cleaning fee', money(r.breakdown.cleaning)),
    line('Service fee', money(r.breakdown.platform)),
    line('Taxes', money(r.breakdown.tax)),
    line('Total charged', money(r.breakdown.total)),
    r.refundAmount !== undefined ? line('Refunded', money(r.refundAmount)) : '',
    '',
    `Cancellation policy: ${r.policy}`,
    '',
    'Exact address is shared once a reservation is confirmed.',
    'staynest.com',
  ].filter(Boolean).join('\n')
}

export function downloadReceipt(r: Reservation): void {
  const blob = new Blob([receiptText(r)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `staynest-receipt-${r.reference}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
