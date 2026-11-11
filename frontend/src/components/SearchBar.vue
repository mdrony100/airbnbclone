<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import GuestsStepper from './GuestsStepper.vue'
import { destinations } from '@/data/destinations'
import { todayISO } from '@/utils/dates'

const props = withDefaults(defineProps<{
  destination?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  variant?: 'hero' | 'inline'
}>(), { destination: '', checkIn: '', checkOut: '', guests: 1, variant: 'hero' })

const router = useRouter()
const dest = ref(props.destination)
const from = ref(props.checkIn)
const to = ref(props.checkOut)
const guests = ref(props.guests)
const guestsOpen = ref(false)
const error = ref('')

watch(() => [props.destination, props.checkIn, props.checkOut, props.guests], () => {
  dest.value = props.destination
  from.value = props.checkIn
  to.value = props.checkOut
  guests.value = props.guests
})

const suggestions = computed(() => {
  const q = dest.value.trim().toLowerCase()
  if (!q) return destinations.slice(0, 5)
  return destinations.filter((d) => `${d.name} ${d.state}`.toLowerCase().includes(q)).slice(0, 6)
})

const minDate = todayISO()
const guestLabel = computed(() => (guests.value === 1 ? '1 guest' : `${guests.value} guests`))

function submit(): void {
  if (from.value && to.value && to.value <= from.value) {
    error.value = 'Check-out must be after check-in.'
    return
  }
  error.value = ''
  const destination = dest.value.trim().toLowerCase()
  const match = destinations.find((d) => `${d.name} ${d.state}`.toLowerCase().includes(destination) || d.name.toLowerCase() === destination)
  router.push({
    path: '/search',
    query: {
      ...(match ? { destination: match.name } : destination ? { destination } : {}),
      ...(from.value ? { checkIn: from.value } : {}),
      ...(to.value ? { checkOut: to.value } : {}),
      ...(guests.value > 1 ? { guests: String(guests.value) } : {}),
    },
  })
}
function pickDestination(name: string): void {
  dest.value = name
  guestsOpen.value = false
}
</script>

<template>
  <form class="w-full" role="search" @submit.prevent="submit" @keydown.esc="guestsOpen = false">
    <div class="grid gap-2 rounded-[26px] border border-line bg-white p-2.5 shadow-lift md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center md:rounded-pill md:p-2">
      <label class="group relative flex flex-col gap-0.5 rounded-2xl px-4 py-2.5 transition hover:bg-sand/60 md:rounded-pill">
        <span class="label">Where</span>
        <input v-model="dest" list="staynest-destinations" type="text" placeholder="Search destinations"
               class="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted/70"
               autocomplete="off" />
        <datalist id="staynest-destinations">
          <option v-for="d in destinations" :key="d.slug" :value="`${d.name}, ${d.state}`" />
        </datalist>
        <Transition name="fade">
          <div v-if="dest && suggestions.length" class="absolute left-0 right-0 top-[calc(100%+8px)] z-30 hidden overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift md:block">
            <button v-for="s in suggestions" :key="s.slug" type="button"
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-sand"
                    @mousedown.prevent="pickDestination(s.name)">
              <AppIcon name="pin" :size="15" class="text-coral" />
              <span class="font-medium">{{ s.name }}</span>
              <span class="text-muted">{{ s.state }}</span>
            </button>
          </div>
        </Transition>
      </label>

      <label class="flex flex-col gap-0.5 rounded-2xl px-4 py-2.5 transition hover:bg-sand/60 md:rounded-pill">
        <span class="label">Check-in</span>
        <input v-model="from" type="date" :min="minDate" class="bg-transparent text-sm font-medium text-ink outline-none" />
      </label>

      <label class="flex flex-col gap-0.5 rounded-2xl px-4 py-2.5 transition hover:bg-sand/60 md:rounded-pill">
        <span class="label">Check-out</span>
        <input v-model="to" type="date" :min="from || minDate" class="bg-transparent text-sm font-medium text-ink outline-none" />
      </label>

      <div class="relative flex items-center gap-2">
        <button type="button"
                class="flex flex-1 flex-col gap-0.5 rounded-2xl px-4 py-2.5 text-left transition hover:bg-sand/60 md:flex-none md:rounded-pill"
                :aria-expanded="guestsOpen" aria-haspopup="dialog" @click="guestsOpen = !guestsOpen">
          <span class="label">Guests</span>
          <span class="text-sm font-medium">{{ guestLabel }}</span>
        </button>
        <button type="submit" class="btn-primary h-12 shrink-0 !px-5 md:h-14 md:!px-6" aria-label="Search stays">
          <AppIcon name="search" :size="18" />
          <span class="hidden md:inline">Search</span>
        </button>

        <Transition name="fade">
          <div v-if="guestsOpen" class="absolute right-0 top-[calc(100%+10px)] z-30 w-72 rounded-2xl border border-line bg-white p-4 shadow-lift">
            <GuestsStepper v-model="guests" :max="16" />
            <div class="mt-2 flex justify-end">
              <button type="button" class="btn-ghost !py-2 !text-xs" @click="guestsOpen = false">Done</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <p v-if="error" class="mt-2 pl-4 text-xs font-medium text-coral">{{ error }}</p>
  </form>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .16s ease, transform .16s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
