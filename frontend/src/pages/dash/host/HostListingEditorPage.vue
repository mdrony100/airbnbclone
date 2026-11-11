<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import { LISTING_TYPES, US_STATES, newListing, stateCodeFor, validateListing, validateStep, type StepError } from '@/utils/listing'
import { AMENITIES } from '@/data/content'
import { money } from '@/utils/format'
import { priceHint } from '@/services/dashboardApi'
import { addDays, todayISO } from '@/utils/dates'
import type { Listing } from '@/types/dashboard'

const dash = useDashboardStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.params.id === 'new')
const existing = computed(() => (isNew.value ? null : dash.listing(String(route.params.id))))
const form = ref<Listing>(existing.value ? JSON.parse(JSON.stringify(existing.value)) : newListing(dash.me?.id ?? 'acc_ada'))
const step = ref(1)
const touched = ref(false)
const saving = ref(false)
const submitting = ref(false)
const savedAt = ref<string | null>(null)
const photoUrl = ref('')
const ruleDraft = ref('')
const blockDate = ref(addDays(todayISO(), 7))

const steps = [
  { n: 1, label: 'Property', icon: 'home' },
  { n: 2, label: 'Location', icon: 'pin' },
  { n: 3, label: 'Capacity', icon: 'users' },
  { n: 4, label: 'Amenities', icon: 'check' },
  { n: 5, label: 'Photos', icon: 'camera' },
  { n: 6, label: 'Pricing', icon: 'tag' },
  { n: 7, label: 'Availability', icon: 'calendar' },
  { n: 8, label: 'Review', icon: 'eye' },
]

const errors = computed<StepError[]>(() => (step.value < 8 ? validateStep(step.value, form.value) : validateListing(form.value)))
const errorFor = (field: string): string | undefined => (touched.value ? errors.value.find((e) => e.field === field)?.message : undefined)
const progress = computed(() => Math.round(((step.value - 1) / (steps.length - 1)) * 100))
const hint = computed(() => priceHint(form.value.stateCode || 'CA'))
const rules = ['No smoking', 'No pets', 'No parties or events', 'Quiet hours after 10pm', 'No unregistered guests overnight']

/* autosave: keeps drafts safe between steps without changing status */
let saveTimer: ReturnType<typeof setTimeout> | null = null
watch(form, () => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    const payload: Listing = { ...form.value }
    if (!isNew.value || payload.title || payload.city) {
      await dash.saveListing(payload)
      savedAt.value = new Date().toISOString()
    }
  }, 900)
}, { deep: true })
onBeforeUnmount(() => { if (saveTimer) clearTimeout(saveTimer) })

function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function next(): void {
  touched.value = true
  if (errors.value.length) return
  touched.value = false
  step.value = Math.min(8, step.value + 1)
}
function back(): void {
  touched.value = false
  step.value = Math.max(1, step.value - 1)
}

async function saveDraft(): Promise<void> {
  saving.value = true
  try {
    form.value.stateCode = stateCodeFor(form.value.state)
    await dash.saveListing({ ...form.value, status: form.value.status === 'published' ? 'published' : 'draft' })
    savedAt.value = new Date().toISOString()
    toast.push('Draft saved.')
  } finally {
    saving.value = false
  }
}

async function submit(): Promise<void> {
  if (validateListing(form.value).length) {
    touched.value = true
    step.value = 1
    toast.push('Fix the highlighted fields before submitting.', 'error')
    return
  }
  submitting.value = true
  try {
    form.value.stateCode = stateCodeFor(form.value.state)
    form.value.slug = form.value.slug || form.value.id
    await dash.saveListing({ ...form.value, status: 'draft' })
    await dash.setListingStatus(form.value.id, 'pending')
    toast.push('Listing submitted. It stays pending until the demo review approves it.')
    router.push('/dashboard/host/listings')
  } finally {
    submitting.value = false
  }
}

function addPhoto(): void {
  const url = photoUrl.value.trim()
  if (!url) return
  form.value.photos.push(url)
  photoUrl.value = ''
}
function removePhoto(i: number): void {
  form.value.photos.splice(i, 1)
  if (form.value.coverIndex >= form.value.photos.length) form.value.coverIndex = 0
}
function movePhoto(i: number, dir: -1 | 1): void {
  const j = i + dir
  if (j < 0 || j >= form.value.photos.length) return
  const list = form.value.photos
  ;[list[i], list[j]] = [list[j], list[i]]
  if (form.value.coverIndex === i) form.value.coverIndex = j
  else if (form.value.coverIndex === j) form.value.coverIndex = i
}
let dragIndex: number | null = null
function onDrop(i: number): void {
  if (dragIndex === null || dragIndex === i) return
  const list = form.value.photos
  const [moved] = list.splice(dragIndex, 1)
  list.splice(i, 0, moved)
  dragIndex = null
}

const nightsPreview = computed(() => Math.max(1, form.value.minStay))
const previewTotals = computed(() => {
  const nightly = form.value.pricePerNight * nightsPreview.value
  const fee = Math.round(nightly * 0.09)
  const tax = Math.round((nightly + form.value.cleaningFee + fee) * 0.085)
  return { nightly, fee, tax, total: nightly + form.value.cleaningFee + fee + tax }
})

const conflicts = computed(() => {
  const booked = dash.hostReservations
    .filter((r) => r.listingId === form.value.id && r.status !== 'canceled')
    .flatMap((r) => {
      const days: string[] = []
      let d = r.checkIn
      while (d < r.checkOut) { days.push(d); d = addDays(d, 1) }
      return days
    })
  return form.value.blocked.filter((d) => booked.includes(d))
})

function addBlockedDate(): void {
  const d = blockDate.value
  if (!d) return
  if (conflicts.value.includes(d)) { toast.push('That night is part of a confirmed reservation.', 'error'); return }
  if (!form.value.blocked.includes(d)) form.value.blocked = [...form.value.blocked, d].sort()
}
function removeBlockedDate(d: string): void {
  form.value.blocked = form.value.blocked.filter((x) => x !== d)
}
</script>

<template>
  <div v-if="form" class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <RouterLink to="/dashboard/host/listings" class="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <AppIcon name="chevron-left" :size="14" /> All properties
      </RouterLink>
      <div class="flex items-center gap-2">
        <StatusPill :status="form.status" />
        <span v-if="savedAt" class="text-[11px] text-muted">Draft saved</span>
      </div>
    </div>

    <header>
      <p class="label">{{ isNew ? 'New listing' : 'Edit listing' }}</p>
      <h1 class="mt-1 font-display text-3xl text-ink">{{ form.title || 'Untitled listing' }}</h1>
      <p class="mt-1 text-sm text-muted">Step {{ step }} of 8 · {{ steps.find((s) => s.n === step)?.label }}</p>
    </header>

    <div v-if="form.status === 'pending'" class="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
      <AppIcon name="info" :size="16" class="mt-0.5 shrink-0" />
      This listing is awaiting review. Edits made now are captured in the draft but the live version stays hidden until approval.
    </div>
    <div v-if="form.status === 'rejected' && form.rejectionReason" class="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
      <AppIcon name="alert" :size="16" class="mt-0.5 shrink-0" />
      <span><span class="font-semibold">Review feedback:</span> {{ form.rejectionReason }}</span>
    </div>

    <!-- progress -->
    <div class="space-y-2">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div class="h-full rounded-full bg-coral transition-all" :style="{ width: `${progress}%` }" />
      </div>
      <ol class="flex flex-wrap gap-1.5 text-[11px]">
        <li v-for="s in steps" :key="s.n">
          <button
            class="rounded-full px-2.5 py-1 font-semibold transition"
            :class="s.n === step ? 'bg-ink text-white' : s.n < step ? 'bg-sand text-ink/70' : 'text-muted hover:bg-sand/60'"
            @click="step = s.n"
          >{{ s.n }}. {{ s.label }}</button>
        </li>
      </ol>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section class="card p-5">
        <!-- step 1 -->
        <div v-if="step === 1" class="space-y-4">
          <div>
            <p class="label">Property type</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="t in LISTING_TYPES"
                :key="t.value"
                class="rounded-full border px-3 py-1.5 text-sm font-medium transition"
                :class="form.type === t.value ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/70 hover:border-ink/25'"
                @click="form.type = t.value"
              >{{ t.label }}</button>
            </div>
          </div>
          <div>
            <label class="label" for="l-title">Listing title</label>
            <input id="l-title" v-model="form.title" class="field mt-1" placeholder="Cedar cabin above the creek" />
            <p class="mt-1 text-[11px]" :class="errorFor('title') ? 'text-coral' : 'text-muted'">{{ errorFor('title') ?? 'A short, specific title works best.' }}</p>
          </div>
          <div>
            <label class="label" for="l-desc">Description</label>
            <textarea id="l-desc" v-model="form.description" rows="7" class="field mt-1" placeholder="What makes the space comfortable, quiet or unusual? Mention the neighbourhood and anything a guest should plan for." />
            <p class="mt-1 text-[11px]" :class="errorFor('description') ? 'text-coral' : 'text-muted'">{{ errorFor('description') ?? `${form.description.trim().length} characters, 40 minimum.` }}</p>
          </div>
        </div>

        <!-- step 2 -->
        <div v-else-if="step === 2" class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label" for="l-address">Street address</label>
              <input id="l-address" v-model="form.addressLine" class="field mt-1" placeholder="240 Ridge Road" />
              <p v-if="errorFor('addressLine')" class="mt-1 text-[11px] text-coral">{{ errorFor('addressLine') }}</p>
            </div>
            <div>
              <label class="label" for="l-city">City</label>
              <input id="l-city" v-model="form.city" class="field mt-1" placeholder="Hudson" />
              <p v-if="errorFor('city')" class="mt-1 text-[11px] text-coral">{{ errorFor('city') }}</p>
            </div>
            <div>
              <label class="label" for="l-state">State</label>
              <select id="l-state" v-model="form.state" class="field mt-1">
                <option value="">Choose a state</option>
                <option v-for="s in US_STATES" :key="s" :value="s">{{ s }}</option>
              </select>
              <p v-if="errorFor('state')" class="mt-1 text-[11px] text-coral">{{ errorFor('state') }}</p>
            </div>
            <div>
              <label class="label" for="l-zip">ZIP code</label>
              <input id="l-zip" v-model="form.zip" class="field mt-1" inputmode="numeric" placeholder="12534" />
              <p v-if="errorFor('zip')" class="mt-1 text-[11px] text-coral">{{ errorFor('zip') }}</p>
            </div>
            <div>
              <label class="label" for="l-lat">Approximate latitude</label>
              <input id="l-lat" v-model.number="form.lat" type="number" step="0.01" class="field mt-1" />
            </div>
            <div>
              <label class="label" for="l-lng">Approximate longitude</label>
              <input id="l-lng" v-model.number="form.lng" type="number" step="0.01" class="field mt-1" />
            </div>
          </div>
          <p class="rounded-xl bg-sand/70 p-3 text-xs text-ink/70">
            <AppIcon name="info" :size="13" class="mr-1 inline" />
            Guests only see an approximate area until a booking is confirmed. A real map provider arrives with the Laravel milestone.
          </p>
        </div>

        <!-- step 3 -->
        <div v-else-if="step === 3" class="grid gap-4 sm:grid-cols-2">
          <div v-for="field in [
            { key: 'guests', label: 'Guests', min: 1 },
            { key: 'bedrooms', label: 'Bedrooms', min: 0 },
            { key: 'beds', label: 'Beds', min: 1 },
            { key: 'baths', label: 'Bathrooms', min: 1 },
          ]" :key="field.key">
            <label class="label" :for="`l-${field.key}`">{{ field.label }}</label>
            <div class="mt-1 flex items-center gap-2">
              <button class="grid h-9 w-9 place-items-center rounded-full border border-line" :aria-label="`Fewer ${field.label}`" @click="form[field.key as 'guests'] = Math.max(field.min, form[field.key as 'guests'] - 1)">
                <AppIcon name="minus" :size="14" />
              </button>
              <input :id="`l-${field.key}`" v-model.number="form[field.key as 'guests']" type="number" class="field text-center" :min="field.min" />
              <button class="grid h-9 w-9 place-items-center rounded-full border border-line" :aria-label="`More ${field.label}`" @click="form[field.key as 'guests'] = form[field.key as 'guests'] + 1">
                <AppIcon name="plus" :size="14" />
              </button>
            </div>
            <p v-if="errorFor(field.key)" class="mt-1 text-[11px] text-coral">{{ errorFor(field.key) }}</p>
          </div>
        </div>

        <!-- step 4 -->
        <div v-else-if="step === 4" class="space-y-5">
          <div>
            <p class="label">Amenities <span class="text-muted">({{ form.amenities.length }} selected, 3 minimum)</span></p>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <label v-for="a in AMENITIES" :key="a.id" class="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:border-ink/25">
                <input type="checkbox" class="h-4 w-4 accent-coral" :checked="form.amenities.includes(a.id)" @change="form.amenities = toggleIn(form.amenities, a.id)" />
                {{ a.label }}
              </label>
            </div>
            <p v-if="errorFor('amenities')" class="mt-1 text-[11px] text-coral">{{ errorFor('amenities') }}</p>
          </div>
          <div>
            <p class="label">House rules</p>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <label v-for="r in rules" :key="r" class="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <input type="checkbox" class="h-4 w-4 accent-coral" :checked="form.houseRules.includes(r)" @change="form.houseRules = toggleIn(form.houseRules, r)" />
                {{ r }}
              </label>
            </div>
            <div class="mt-2 flex gap-2">
              <input v-model="ruleDraft" class="field" placeholder="Add another rule" aria-label="Add another house rule" />
              <button class="btn-ghost" @click="form.houseRules = toggleIn(form.houseRules, ruleDraft.trim()); ruleDraft = ''" :disabled="!ruleDraft.trim()">Add</button>
            </div>
            <p v-if="errorFor('houseRules')" class="mt-1 text-[11px] text-coral">{{ errorFor('houseRules') }}</p>
          </div>
        </div>

        <!-- step 5 -->
        <div v-else-if="step === 5" class="space-y-4">
          <p class="label">Photos <span class="text-muted">({{ form.photos.length }}, 3 minimum)</span></p>
          <p class="text-xs text-muted">Uploads land with the Laravel milestone. For now paste an image URL, then drag to reorder and pick the cover.</p>
          <div class="flex flex-wrap gap-2">
            <input v-model="photoUrl" class="field flex-1" placeholder="https://…" aria-label="Photo URL" />
            <button class="btn-ghost" :disabled="!photoUrl.trim()" @click="addPhoto"><AppIcon name="plus" :size="14" /> Add photo</button>
          </div>
          <p v-if="errorFor('photos')" class="text-[11px] text-coral">{{ errorFor('photos') }}</p>

          <ul class="grid gap-2 sm:grid-cols-2">
            <li
              v-for="(p, i) in form.photos"
              :key="p + i"
              class="group relative overflow-hidden rounded-xl border border-line"
              draggable="true"
              @dragstart="dragIndex = i"
              @dragover.prevent
              @drop="onDrop(i)"
            >
              <img :src="p" :alt="`Photo ${i + 1}`" class="h-32 w-full object-cover" loading="lazy" />
              <span v-if="form.coverIndex === i" class="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">Cover</span>
              <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/70 p-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button class="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-white/20" @click="form.coverIndex = i">Cover</button>
                <div class="flex gap-1">
                  <button class="rounded px-1.5 py-0.5 text-[10px] text-white hover:bg-white/20" @click="movePhoto(i, -1)">←</button>
                  <button class="rounded px-1.5 py-0.5 text-[10px] text-white hover:bg-white/20" @click="movePhoto(i, 1)">→</button>
                  <button class="rounded px-1.5 py-0.5 text-[10px] text-white hover:bg-rose-500/70" @click="removePhoto(i)">Remove</button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- step 6 -->
        <div v-else-if="step === 6" class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="l-price">Nightly price (USD)</label>
              <input id="l-price" v-model.number="form.pricePerNight" type="number" min="20" class="field mt-1" />
              <p class="mt-1 text-[11px] text-muted">Comparable stays nearby: {{ money(hint.low) }} to {{ money(hint.high) }}.</p>
              <p v-if="errorFor('pricePerNight')" class="text-[11px] text-coral">{{ errorFor('pricePerNight') }}</p>
            </div>
            <div>
              <label class="label" for="l-cleaning">Cleaning fee (USD)</label>
              <input id="l-cleaning" v-model.number="form.cleaningFee" type="number" min="0" class="field mt-1" />
              <p v-if="errorFor('cleaningFee')" class="mt-1 text-[11px] text-coral">{{ errorFor('cleaningFee') }}</p>
            </div>
            <div>
              <label class="label" for="l-min">Minimum stay (nights)</label>
              <input id="l-min" v-model.number="form.minStay" type="number" min="1" class="field mt-1" />
              <p v-if="errorFor('minStay')" class="mt-1 text-[11px] text-coral">{{ errorFor('minStay') }}</p>
            </div>
            <div>
              <label class="label" for="l-policy">Cancellation policy</label>
              <select id="l-policy" v-model="form.policy" class="field mt-1">
                <option value="flexible">Flexible — full refund up to 24h before</option>
                <option value="moderate">Moderate — full refund 5 days before</option>
                <option value="strict">Strict — 50% refund 7 days before</option>
              </select>
            </div>
          </div>
          <div class="rounded-xl bg-sand/70 p-3 text-sm">
            <p class="font-semibold text-ink">Guest pays for {{ nightsPreview }} night{{ nightsPreview > 1 ? 's' : '' }}</p>
            <p class="mt-1 flex justify-between text-ink/80"><span>Nightly</span><span>{{ money(previewTotals.nightly) }}</span></p>
            <p class="flex justify-between text-ink/80"><span>Cleaning</span><span>{{ money(form.cleaningFee) }}</span></p>
            <p class="flex justify-between text-ink/80"><span>Service fee</span><span>{{ money(previewTotals.fee) }}</span></p>
            <p class="flex justify-between text-ink/80"><span>Taxes</span><span>{{ money(previewTotals.tax) }}</span></p>
            <p class="mt-1 flex justify-between border-t border-line pt-1 font-semibold"><span>Total</span><span>{{ money(previewTotals.total) }}</span></p>
          </div>
        </div>

        <!-- step 7 -->
        <div v-else-if="step === 7" class="space-y-4">
          <p class="text-sm text-muted">Block dates you do not want to rent. Reservations always win: a night that is part of a confirmed booking cannot be blocked.</p>
          <div class="flex flex-wrap gap-2">
            <input v-model="blockDate" type="date" class="field max-w-[190px]" aria-label="Date to block" />
            <button class="btn-ghost" @click="addBlockedDate"><AppIcon name="plus" :size="14" /> Block this night</button>
          </div>
          <p v-if="conflicts.length" class="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
            {{ conflicts.length }} blocked date{{ conflicts.length > 1 ? 's' : '' }} overlap a confirmed reservation and will be ignored by the calendar.
          </p>
          <div v-if="form.blocked.length" class="flex flex-wrap gap-2">
            <span v-for="d in form.blocked" :key="d" class="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs text-ink/80">
              {{ d }}
              <button class="text-muted hover:text-coral" :aria-label="`Unblock ${d}`" @click="removeBlockedDate(d)"><AppIcon name="close" :size="12" /></button>
            </span>
          </div>
          <p v-else class="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No blocked dates yet.</p>
        </div>

        <!-- step 8 -->
        <div v-else class="space-y-4">
          <h2 class="font-display text-xl text-ink">Review and submit</h2>
          <div class="overflow-hidden rounded-xl border border-line">
            <img :src="form.photos[form.coverIndex] ?? form.photos[0]" :alt="form.title" class="h-40 w-full object-cover" />
            <div class="p-3">
              <p class="font-semibold text-ink">{{ form.title || 'Untitled listing' }}</p>
              <p class="text-xs text-muted">{{ form.city || 'City' }}, {{ form.state || 'State' }} · {{ form.guests }} guests · {{ form.bedrooms }} bedrooms · {{ form.beds }} beds · {{ form.baths }} baths</p>
              <p class="mt-1 text-sm text-ink">{{ money(form.pricePerNight) }} / night · {{ money(form.cleaningFee) }} cleaning · {{ form.minStay }} night minimum · {{ form.policy }}</p>
              <p class="mt-1 text-xs text-muted">{{ form.amenities.length }} amenities · {{ form.houseRules.length }} rules · {{ form.photos.length }} photos · {{ form.blocked.length }} blocked dates</p>
            </div>
          </div>

          <div v-if="validateListing(form).length" class="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
            <p class="font-semibold">Still missing</p>
            <ul class="mt-1 list-inside list-disc">
              <li v-for="e in validateListing(form)" :key="e.field">{{ e.message }}</li>
            </ul>
          </div>
          <p v-else class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Everything checks out. Submitting sends this listing to the demo review queue.</p>

          <div class="flex flex-wrap gap-2">
            <button class="btn-ghost" :disabled="saving" @click="saveDraft">{{ saving ? 'Saving…' : 'Save as draft' }}</button>
            <button class="btn-primary" :disabled="submitting || validateListing(form).length > 0" @click="submit">
              {{ submitting ? 'Submitting…' : 'Submit for approval' }}
            </button>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between border-t border-line pt-4">
          <button class="btn-ghost" :disabled="step === 1" @click="back"><AppIcon name="chevron-left" :size="14" /> Back</button>
          <div class="flex items-center gap-2">
            <button class="text-xs font-semibold text-muted hover:text-ink" :disabled="saving" @click="saveDraft">Save draft</button>
            <button v-if="step < 8" class="btn-primary" @click="next">Continue <AppIcon name="chevron-right" :size="14" /></button>
          </div>
        </div>
      </section>

      <aside class="space-y-3">
        <div class="card p-4">
          <p class="label">Live preview</p>
          <img :src="form.photos[form.coverIndex] ?? form.photos[0]" :alt="form.title || 'Preview'" class="mt-2 h-32 w-full rounded-xl object-cover" />
          <p class="mt-2 font-semibold text-ink">{{ form.title || 'Your listing title' }}</p>
          <p class="text-xs text-muted">{{ form.city || 'City' }}, {{ form.state || 'State' }}</p>
          <p class="mt-1 text-sm text-ink">{{ money(form.pricePerNight) }} <span class="text-muted">/ night</span></p>
        </div>
        <div class="card p-4 text-sm">
          <p class="font-semibold text-ink">Publishing checklist</p>
          <ul class="mt-2 space-y-1.5 text-xs">
            <li v-for="row in [
              { label: 'Title and description', done: validateStep(1, form).length === 0 },
              { label: 'US address', done: validateStep(2, form).length === 0 },
              { label: 'Capacity', done: validateStep(3, form).length === 0 },
              { label: 'Amenities and rules', done: validateStep(4, form).length === 0 },
              { label: 'Three photos', done: validateStep(5, form).length === 0 },
              { label: 'Pricing', done: validateStep(6, form).length === 0 },
            ]" :key="row.label" class="flex items-center gap-2">
              <span class="grid h-4 w-4 place-items-center rounded-full text-[10px]" :class="row.done ? 'bg-emerald-100 text-emerald-700' : 'bg-line text-muted'">
                <AppIcon :name="row.done ? 'check' : 'minus'" :size="10" />
              </span>
              <span :class="row.done ? 'text-ink/70' : 'text-muted'">{{ row.label }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="card p-8 text-center">
    <p class="font-display text-xl text-ink">Listing not found</p>
    <RouterLink to="/dashboard/host/listings" class="btn-primary mt-4">Back to properties</RouterLink>
  </div>
</template>
