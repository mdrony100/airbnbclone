<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Property, Review } from '@/types'
import { api, isRangeAvailable } from '@/services/api'
import { AMENITIES, amenityLabel } from '@/data/content'
import { reviewsFor, ratingBreakdown } from '@/data/reviews'
import { money, dateLong } from '@/utils/format'
import { nightsBetween } from '@/utils/dates'
import AppIcon from '@/components/AppIcon.vue'
import StarRating from '@/components/StarRating.vue'
import PropertyCard from '@/components/PropertyCard.vue'
import BookingPanel from '@/components/BookingPanel.vue'
import AvailabilityCalendar from '@/components/AvailabilityCalendar.vue'
import { useToast } from '@/composables/useToast'
import { updateMeta } from '@/utils/seo'

const route = useRoute()
const router = useRouter()
const { push } = useToast()

const property = ref<Property | null>(null)
const related = ref<Property[]>([])
const loading = ref(true)
const checkIn = ref('')
const checkOut = ref('')
const guests = ref(2)
const lightbox = ref(false)
const photoIndex = ref(0)
const calendarOpen = ref(false)
const reviews = ref<Review[]>([])
const breakdown = ref<{ label: string; value: number }[]>([])
const dateError = ref('')

const amenitiesDetailed = computed(() => {
  if (!property.value) return []
  return AMENITIES.filter((a) => property.value!.amenities.includes(a.id))
})
const nights = computed(() => nightsBetween(checkIn.value, checkOut.value))

async function load(slug: string): Promise<void> {
  loading.value = true
  const [p, rel] = await Promise.all([api.property(slug), api.related(slug)])
  property.value = p
  related.value = rel
  if (p) {
    reviews.value = reviewsFor(p)
    breakdown.value = ratingBreakdown(p)
  }
  loading.value = false
  if (p) {
    updateMeta(
      `${p.title} · ${p.city}, ${p.state} — StayNest`,
      `${p.summary} Sleeps ${p.guests}, ${p.bedrooms} bedrooms, from $${p.pricePerNight} a night.`,
      p.photos[0],
    )
  } else {
    updateMeta('Stay not found — StayNest', 'That stay could not be found.')
  }
}

onMounted(async () => {
  checkIn.value = typeof route.query.checkIn === 'string' ? route.query.checkIn : ''
  checkOut.value = typeof route.query.checkOut === 'string' ? route.query.checkOut : ''
  guests.value = Number(route.query.guests ?? 2)
  await load(String(route.params.slug))
})

watch(() => route.params.slug, (slug) => { if (slug) load(String(slug)) })
watch([checkIn, checkOut], ([a, b]) => {
  dateError.value = ''
  if (property.value && a && b && !isRangeAvailable(property.value, a, b)) {
    dateError.value = 'Those dates are not available. Pick a different range.'
  }
})

function openLightbox(i: number): void {
  photoIndex.value = i
  lightbox.value = true
  document.body.style.overflow = 'hidden'
}
function closeLightbox(): void {
  lightbox.value = false
  document.body.style.overflow = ''
}
function move(dir: number): void {
  if (!property.value) return
  const n = property.value.photos.length
  photoIndex.value = (photoIndex.value + dir + n) % n
}
function onKey(e: KeyboardEvent): void {
  if (!lightbox.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') move(1)
  if (e.key === 'ArrowLeft') move(-1)
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' })

function reserve(): void {
  if (!property.value) return
  if (nights.value < 1) { calendarOpen.value = true; push('Choose your dates first'); return }
  router.push({ path: `/checkout/${property.value.slug}`, query: { checkIn: checkIn.value, checkOut: checkOut.value, guests: String(guests.value) } })
}
const mapLink = computed(() => {
  if (!property.value) return '#'
  const { lat, lng } = property.value
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=11/${lat}/${lng}`
})
</script>

<template>
  <div class="shell py-6 sm:py-8">
    <div v-if="loading" class="space-y-4">
      <div class="skeleton h-8 w-2/3" />
      <div class="skeleton h-[26rem] w-full" />
    </div>

    <div v-else-if="!property" class="py-24 text-center">
      <h1 class="font-display text-3xl">That stay could not be found</h1>
      <p class="mt-2 text-muted">It may have been removed, or the link is mistyped.</p>
      <RouterLink to="/search" class="btn-primary mt-6 inline-flex">Browse all stays</RouterLink>
    </div>

    <template v-else>
      <nav class="mb-4 flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
        <RouterLink to="/search" class="hover:text-ink">Stays</RouterLink>
        <span>/</span>
        <RouterLink :to="`/search?destination=${encodeURIComponent(property.city)}`" class="hover:text-ink">{{ property.city }}</RouterLink>
        <span>/</span>
        <span class="text-ink">{{ property.title }}</span>
      </nav>

      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-3xl leading-tight sm:text-[2.6rem]">{{ property.title }}</h1>
          <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <StarRating :value="property.rating" :size="13" />
            <span>· {{ property.reviewCount }} reviews</span>
            <span>· {{ property.city }}, {{ property.state }}</span>
            <span v-if="property.featured" class="rounded-pill bg-coral-soft px-2 py-0.5 text-[11px] font-semibold text-coral-dark">Guest favourite</span>
          </p>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost !py-2 text-xs" @click="push('Link copied to clipboard')">
            <AppIcon name="share" :size="14" /> Share
          </button>
        </div>
      </header>

      <!-- photo collage -->
      <section class="mt-5 grid gap-2 overflow-hidden rounded-[26px] sm:grid-cols-[1.6fr_1fr] sm:grid-rows-2">
        <button class="relative overflow-hidden sm:row-span-2" @click="openLightbox(0)">
          <img :src="property.photos[0]" :alt="`${property.title} main photo`" class="h-64 w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[27rem]" />
          <span class="absolute bottom-3 left-3 rounded-pill bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur">View all {{ property.photos.length }} photos</span>
        </button>
        <button v-for="(src, i) in property.photos.slice(1, 3)" :key="src" class="relative hidden overflow-hidden sm:block" @click="openLightbox(i + 1)">
          <img :src="src" :alt="`${property.title} photo ${i + 2}`" class="h-full w-full object-cover transition duration-700 hover:scale-[1.03]" />
        </button>
        <button class="relative hidden overflow-hidden sm:col-span-2 sm:block" @click="openLightbox(3)">
          <img :src="property.photos[3]" :alt="`${property.title} interior`" class="h-24 w-full object-cover transition duration-700 hover:scale-[1.03]" />
        </button>
        <div class="grid grid-cols-4 gap-2 sm:hidden">
          <button v-for="(src, i) in property.photos.slice(1, 5)" :key="src" class="overflow-hidden rounded-xl" @click="openLightbox(i + 1)">
            <img :src="src" :alt="`${property.title} photo ${i + 2}`" class="h-16 w-full object-cover" loading="lazy" />
          </button>
        </div>
      </section>

      <div class="mt-10 grid gap-12 lg:grid-cols-[1fr_23rem] lg:items-start">
        <div class="min-w-0">
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div>
              <h2 class="font-display text-2xl">{{ property.type === 'beachhouse' ? 'Beach house' : property.type[0].toUpperCase() + property.type.slice(1) }} hosted by {{ property.host.name }}</h2>
              <p class="mt-1.5 text-sm text-muted">
                {{ property.bedrooms }} bedroom{{ property.bedrooms > 1 ? 's' : '' }} · {{ property.beds }} bed{{ property.beds > 1 ? 's' : '' }} · {{ property.baths }} bath{{ property.baths > 1 ? 's' : '' }} · sleeps {{ property.guests }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-full bg-ink text-sm font-semibold text-white">{{ property.host.initials }}</span>
              <div class="text-xs text-muted">
                <p v-if="property.host.superhost" class="font-semibold text-ink">Superhost</p>
                <p>Joined {{ property.host.joined }} · {{ property.host.responseRate }}% response</p>
              </div>
            </div>
          </div>

          <div class="prose-copy mt-6 max-w-2xl">
            <p class="!mt-0 text-base leading-relaxed">{{ property.summary }}</p>
            <p v-for="(para, i) in property.description" :key="i">{{ para }}</p>
          </div>

          <!-- amenities -->
          <section class="mt-10 border-t border-line pt-8">
            <h2 class="font-display text-2xl">What this place offers</h2>
            <ul class="mt-5 grid gap-3 sm:grid-cols-2">
              <li v-for="a in amenitiesDetailed" :key="a.id" class="flex items-center gap-3 text-sm">
                <span class="grid h-8 w-8 place-items-center rounded-full bg-sand text-ink"><AppIcon :name="a.icon" :size="15" /></span>
                {{ a.label }}
              </li>
            </ul>
            <p class="mt-4 text-xs text-muted">Showing {{ amenitiesDetailed.length }} of {{ property.amenities.length }} listed amenities.</p>
          </section>

          <!-- calendar -->
          <section class="mt-10 border-t border-line pt-8">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 class="font-display text-2xl">Availability</h2>
                <p class="mt-1 text-sm text-muted">{{ nights ? `${nights} night${nights > 1 ? 's' : ''}: ${dateLong(checkIn)} – ${dateLong(checkOut)}` : 'Select a check-in and check-out date' }}</p>
              </div>
              <p v-if="dateError" class="text-xs font-medium text-coral">{{ dateError }}</p>
            </div>
            <div class="mt-5">
              <AvailabilityCalendar v-model:checkIn="checkIn" v-model:checkOut="checkOut" :blocked="property.blocked" />
            </div>
            <p class="mt-3 text-xs text-muted">Minimum stay 1 night. Free cancellation up to 7 days before check-in.</p>
          </section>

          <!-- reviews -->
          <section class="mt-10 border-t border-line pt-8">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="font-display text-2xl flex items-center gap-2"><AppIcon name="star" :size="20" class="text-coral" /> {{ property.rating }} · {{ property.reviewCount }} reviews</h2>
            </div>
            <ul class="mt-5 grid gap-3 sm:grid-cols-2">
              <li v-for="b in breakdown" :key="b.label" class="flex items-center justify-between gap-4 text-sm">
                <span class="text-muted">{{ b.label }}</span>
                <span class="flex flex-1 items-center gap-3">
                  <span class="h-1 flex-1 overflow-hidden rounded-full bg-line"><span class="block h-full rounded-full bg-ink" :style="{ width: `${(b.value / 5) * 100}%` }" /></span>
                  <span class="w-8 text-right font-medium">{{ b.value.toFixed(1) }}</span>
                </span>
              </li>
            </ul>
            <div class="mt-7 grid gap-6 sm:grid-cols-2">
              <article v-for="r in reviews.slice(0, 4)" :key="r.id">
                <div class="flex items-center gap-3">
                  <span class="grid h-9 w-9 place-items-center rounded-full bg-sand text-xs font-semibold">{{ r.initials }}</span>
                  <div>
                    <p class="text-sm font-semibold">{{ r.guest }}</p>
                    <p class="text-xs text-muted">{{ r.date }}</p>
                  </div>
                </div>
                <p class="mt-2.5 text-sm leading-relaxed text-muted">{{ r.text }}</p>
              </article>
            </div>
            <p class="mt-5 text-xs text-muted">Reviews are fictional demo content created for this build.</p>
          </section>

          <!-- house rules + location -->
          <section class="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <div>
              <h2 class="font-display text-xl">House rules</h2>
              <ul class="mt-4 space-y-2.5 text-sm text-muted">
                <li v-for="rule in property.houseRules" :key="rule" class="flex gap-2"><AppIcon name="check" :size="15" class="mt-0.5 shrink-0 text-moss" /> {{ rule }}</li>
              </ul>
              <h3 class="mt-6 font-display text-lg">Cancellation</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">Free cancellation for 7 days before check-in. After that, the first night is refunded but the remainder is not. <RouterLink to="/cancellation-policy" class="link-underline">Full policy</RouterLink>.</p>
            </div>
            <div>
              <h2 class="font-display text-xl">Where you'll be</h2>
              <p class="mt-2 text-sm text-muted">{{ property.city }}, {{ property.state }} — exact address shared once your booking is confirmed.</p>
              <div class="relative mt-4 overflow-hidden rounded-2xl border border-line bg-[#EAE3D8]">
                <div class="absolute inset-0 opacity-60" style="background-image: repeating-linear-gradient(115deg, rgba(255,255,255,.4) 0 2px, transparent 2px 24px);" />
                <div class="relative flex h-48 items-center justify-center">
                  <span class="flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-xs font-semibold shadow-soft">
                    <AppIcon name="pin" :size="14" class="text-coral" /> {{ property.city }}, {{ property.stateCode }}
                  </span>
                </div>
                <a :href="mapLink" target="_blank" rel="noopener" class="absolute bottom-3 right-3 rounded-pill bg-white/95 px-3 py-1.5 text-[11px] font-semibold shadow-soft hover:bg-white">
                  Open approximate area map
                </a>
              </div>
              <p class="mt-2 text-xs text-muted">Approximate location only. A dedicated map provider key is required for an embedded interactive map.</p>
            </div>
          </section>
        </div>

        <!-- sticky booking panel -->
        <aside class="hidden lg:block">
          <div class="sticky top-24">
            <BookingPanel v-model:checkIn="checkIn" v-model:checkOut="checkOut" :guests="guests" :property="property"
                          @update:guests="guests = $event" @open-calendar="calendarOpen = !calendarOpen" />
            <p class="mt-3 text-center text-xs text-muted">Demo checkout · no card is charged</p>
          </div>
        </aside>
      </div>

      <!-- related -->
      <section class="mt-16 border-t border-line pt-10">
        <h2 class="font-display text-2xl">Other stays guests compare</h2>
        <div class="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <PropertyCard v-for="p in related" :key="p.slug" :property="p" :check-in="checkIn" :check-out="checkOut" />
        </div>
      </section>

      <!-- mobile booking bar -->
      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">{{ money(property.pricePerNight) }} <span class="font-normal text-muted">/ night</span></p>
            <p class="text-xs text-muted">{{ nights ? `${nights} night${nights > 1 ? 's' : ''}` : 'Add dates for total' }}</p>
          </div>
          <button class="btn-primary flex-1" @click="reserve">{{ nights ? 'Reserve' : 'Check dates' }}</button>
        </div>
      </div>
      <div class="h-16 lg:hidden" />
    </template>

    <!-- lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="lightbox && property" class="fixed inset-0 z-[80] flex flex-col bg-ink/95 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Photo gallery">
          <div class="flex items-center justify-between text-white">
            <p class="text-sm font-medium">{{ photoIndex + 1 }} / {{ property.photos.length }}</p>
            <button class="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close gallery" @click="closeLightbox">
              <AppIcon name="close" :size="18" />
            </button>
          </div>
          <div class="relative flex flex-1 items-center justify-center">
            <button class="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous photo" @click="move(-1)">
              <AppIcon name="chevron-left" :size="20" />
            </button>
            <img :src="property.photos[photoIndex]" :alt="`${property.title} photo ${photoIndex + 1}`" class="max-h-[78vh] max-w-full rounded-2xl object-contain" />
            <button class="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next photo" @click="move(1)">
              <AppIcon name="chevron-right" :size="20" />
            </button>
          </div>
          <div class="no-scrollbar flex justify-center gap-2 overflow-x-auto pb-2">
            <button v-for="(src, i) in property.photos" :key="src" class="h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2"
                    :class="i === photoIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'" @click="photoIndex = i">
              <img :src="src" alt="" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
