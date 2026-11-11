export const MS_DAY = 86_400_000

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const a = new Date(checkIn + 'T12:00:00').getTime()
  const b = new Date(checkOut + 'T12:00:00').getTime()
  return Math.max(0, Math.round((b - a) / MS_DAY))
}

export function isValidRange(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false
  return nightsBetween(checkIn, checkOut) >= 1
}

/** Deterministic pseudo random 0..1 from a string seed */
export function seeded(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month, 1))
  const startDay = first.getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: (string | null)[] = Array.from({ length: startDay }, () => null)
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10)
    cells.push(iso)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}
