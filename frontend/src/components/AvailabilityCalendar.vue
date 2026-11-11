<script setup lang="ts">
import { computed, ref } from 'vue'
import { addDays, monthMatrix, todayISO } from '@/utils/dates'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ blocked: string[]; checkIn: string; checkOut: string; months?: number }>()
const emit = defineEmits<{ 'update:checkIn': [v: string]; 'update:checkOut': [v: string] }>()
const months = computed(() => props.months ?? 2)
const cursor = ref(new Date())

const blockedSet = computed(() => new Set(props.blocked))
const today = todayISO()

const panels = computed(() => {
  const out: { key: string; label: string; rows: (string | null)[][] }[] = []
  for (let i = 0; i < months.value; i++) {
    const d = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + i, 1)
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rows: monthMatrix(d.getFullYear(), d.getMonth()),
    })
  }
  return out
})

function isBlocked(iso: string): boolean {
  return blockedSet.value.has(iso) || iso < today
}

function stateOf(iso: string | null): 'past' | 'blocked' | 'start' | 'end' | 'in-range' | 'free' {
  if (!iso) return 'free'
  if (iso < today) return 'past'
  if (blockedSet.value.has(iso)) return 'blocked'
  if (iso === props.checkIn) return 'start'
  if (iso === props.checkOut) return 'end'
  if (props.checkIn && props.checkOut && iso > props.checkIn && iso < props.checkOut) return 'in-range'
  return 'free'
}

function pick(iso: string): void {
  if (isBlocked(iso)) return
  // start a new range, or complete one; never let a blocked night into the range
  if (!props.checkIn || (props.checkIn && props.checkOut) || iso <= props.checkIn) {
    emit('update:checkIn', iso)
    emit('update:checkOut', '')
    return
  }
  let cursorIso = props.checkIn
  while (cursorIso < iso) {
    cursorIso = addDays(cursorIso, 1)
    if (blockedSet.value.has(cursorIso)) {
      emit('update:checkIn', iso)
      emit('update:checkOut', '')
      return
    }
  }
  emit('update:checkOut', iso)
}

function shift(dir: number): void {
  const d = new Date(cursor.value)
  d.setMonth(d.getMonth() + dir)
  cursor.value = d
}
const canGoBack = computed(() => {
  const now = new Date()
  return cursor.value.getFullYear() > now.getFullYear() || cursor.value.getMonth() > now.getMonth()
})
</script>

<template>
  <div class="rounded-card border border-line bg-white p-5 sm:p-6">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold">{{ checkIn && checkOut ? `${checkIn} → ${checkOut}` : 'Select your dates' }}</p>
      <div class="flex gap-1.5">
        <button class="grid h-8 w-8 place-items-center rounded-full border border-line transition hover:border-ink/30 disabled:opacity-40"
                :disabled="!canGoBack" aria-label="Previous months" @click="shift(-1)">
          <AppIcon name="chevron-left" :size="15" />
        </button>
        <button class="grid h-8 w-8 place-items-center rounded-full border border-line transition hover:border-ink/30"
                aria-label="Next months" @click="shift(1)">
          <AppIcon name="chevron-right" :size="15" />
        </button>
      </div>
    </div>

    <div class="mt-4 grid gap-6" :class="months > 1 ? 'sm:grid-cols-2' : ''">
      <div v-for="panel in panels" :key="panel.key">
        <p class="mb-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted">{{ panel.label }}</p>
        <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted">
          <span v-for="d in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="d">{{ d }}</span>
        </div>
        <div class="mt-1 grid grid-cols-7 gap-1">
          <template v-for="(row, ri) in panel.rows" :key="ri">
            <template v-for="(iso, ci) in row" :key="`${ri}-${ci}`">
              <span v-if="!iso" />
              <button v-else type="button"
                      class="relative grid aspect-square place-items-center rounded-full text-xs transition"
                      :class="[
                        stateOf(iso) === 'start' || stateOf(iso) === 'end' ? 'bg-ink font-semibold text-white' : '',
                        stateOf(iso) === 'in-range' ? 'bg-sand text-ink' : '',
                        stateOf(iso) === 'free' ? 'hover:bg-sand' : '',
                        stateOf(iso) === 'blocked' ? 'cursor-not-allowed text-muted/40 line-through' : '',
                        stateOf(iso) === 'past' ? 'cursor-not-allowed text-muted/30' : '',
                      ]"
                      :disabled="stateOf(iso) === 'blocked' || stateOf(iso) === 'past'"
                      :aria-label="`${iso}${stateOf(iso) === 'blocked' ? ' unavailable' : ''}`"
                      :data-day="iso"
                      @click="pick(iso)">
                {{ Number(iso.slice(-2)) }}
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>

    <p class="mt-4 flex items-center gap-1.5 text-xs text-muted">
      <span class="h-2 w-2 rounded-full bg-coral" /> Struck-through dates are already booked
    </p>
  </div>
</template>
