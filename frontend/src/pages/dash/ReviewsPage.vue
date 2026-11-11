<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import EmptyState from '@/components/dash/EmptyState.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import { dateLong } from '@/utils/format'
import type { Reservation } from '@/types/dashboard'

const dash = useDashboardStore()
const toast = useToast()

const active = ref<Reservation | null>(null)
const rating = ref(0)
const text = ref('')
const error = ref('')
const saving = ref(false)

const awaiting = computed(() => dash.reviewableTrips)
const written = computed(() => dash.myReviews.slice().sort((a, b) => b.at.localeCompare(a.at)))

function open(r: Reservation): void {
  active.value = r
  rating.value = 0
  text.value = ''
  error.value = ''
}

async function submit(): Promise<void> {
  error.value = ''
  if (!rating.value) { error.value = 'Choose a rating from 1 to 5 stars.'; return }
  if (text.value.trim().length < 20) { error.value = 'Please write at least 20 characters so the review is useful.'; return }
  if (!active.value) return
  saving.value = true
  try {
    await dash.addReview(active.value.code, rating.value, text.value)
    toast.push('Thanks, your demo review was published.')
    active.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'The review could not be saved.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <header>
      <p class="label">Guest</p>
      <h1 class="mt-1 font-display text-3xl text-ink">Reviews</h1>
      <p class="mt-1 text-sm text-muted">One review per completed stay. Cancelled and upcoming bookings cannot be reviewed.</p>
    </header>

    <section class="space-y-3">
      <h2 class="font-display text-xl text-ink">Awaiting your review</h2>
      <EmptyState
        v-if="!awaiting.length"
        title="Nothing to review right now"
        body="Reviews open after a stay is completed."
        icon="star"
      />
      <div v-else class="space-y-3">
        <article v-for="r in awaiting" :key="r.code" class="card p-4">
          <div class="flex items-center gap-3">
            <img :src="r.propertyPhoto" :alt="r.propertyTitle" class="h-14 w-16 rounded-xl object-cover" loading="lazy" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-ink">{{ r.propertyTitle }}</p>
              <p class="text-xs text-muted">{{ dateLong(r.checkIn) }} – {{ dateLong(r.checkOut) }} · {{ r.hostName }}</p>
            </div>
            <button class="btn-ghost shrink-0" @click="open(r)">Review stay</button>
          </div>

          <form v-if="active?.code === r.code" class="mt-4 space-y-3 border-t border-line pt-4" @submit.prevent="submit">
            <div>
              <p class="label">Your rating</p>
              <div class="mt-1 flex gap-1">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="grid h-9 w-9 place-items-center rounded-full border transition"
                  :class="rating >= n ? 'border-coral bg-coral/10 text-coral' : 'border-line text-muted'"
                  :aria-label="`${n} star${n > 1 ? 's' : ''}`"
                  @click="rating = n"
                >
                  <AppIcon name="star" :size="16" />
                </button>
              </div>
            </div>
            <div>
              <label class="label" :for="`review-${r.code}`">Your stay in a few words</label>
              <textarea :id="`review-${r.code}`" v-model="text" rows="4" class="field mt-1" placeholder="What worked, what surprised you, what should the next guest know?" />
              <p class="mt-1 text-[11px] text-muted">{{ text.trim().length }} / 20 characters minimum</p>
            </div>
            <p v-if="error" class="text-sm text-coral">{{ error }}</p>
            <div class="flex gap-2">
              <button type="button" class="btn-ghost" @click="active = null">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Publish review' }}</button>
            </div>
          </form>
        </article>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="font-display text-xl text-ink">Reviews you have written</h2>
      <p v-if="!written.length" class="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">No reviews yet.</p>
      <div v-else class="space-y-3">
        <article v-for="rv in written" :key="rv.id" class="card p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <RouterLink :to="`/stays/${rv.propertySlug}`" class="text-sm font-semibold text-ink hover:underline">{{ rv.propertyTitle }}</RouterLink>
            <span class="inline-flex items-center gap-1 text-sm font-semibold text-ink">★ {{ rv.rating }}.0 <span class="font-normal text-muted">· {{ dateLong(rv.at.slice(0, 10)) }}</span></span>
          </div>
          <p class="mt-2 text-sm text-ink">{{ rv.text }}</p>
          <p v-if="rv.hostReply" class="mt-3 rounded-xl bg-sand/70 p-3 text-sm"><span class="font-semibold">Host reply:</span> {{ rv.hostReply }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
