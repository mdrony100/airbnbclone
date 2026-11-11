<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import StarRating from '@/components/StarRating.vue'
import EmptyState from '@/components/dash/EmptyState.vue'
import { useToast } from '@/composables/useToast'
import { timeAgo } from '@/utils/format'

const dash = useDashboardStore()
const toast = useToast()
const drafts = ref<Record<string, string>>({})
const open = ref<string | null>(null)

const reviews = computed(() => dash.hostReviews)
const average = computed(() => {
  if (!reviews.value.length) return 0
  return reviews.value.reduce((n, r) => n + r.rating, 0) / reviews.value.length
})

async function send(id: string): Promise<void> {
  const text = (drafts.value[id] ?? '').trim()
  if (text.length < 10) return toast.push('Write at least a sentence before replying.', 'error')
  await dash.replyToReview(id, text)
  drafts.value[id] = ''
  open.value = null
  toast.push('Reply published.', 'success')
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label">Feedback</p>
        <h1 class="mt-1 font-display text-3xl">Reviews</h1>
        <p class="mt-1 text-sm text-muted">What guests said about your listings. Replies are public.</p>
      </div>
      <div v-if="reviews.length" class="text-right">
        <p class="font-display text-3xl">{{ average.toFixed(1) }}</p>
        <StarRating :value="Math.round(average)" :size="14" />
        <p class="text-xs text-muted">{{ reviews.length }} {{ reviews.length === 1 ? 'review' : 'reviews' }}</p>
      </div>
    </header>

    <EmptyState v-if="!reviews.length" icon="star" title="No reviews yet" body="Reviews appear here after guests complete a stay at one of your properties." />

    <div v-else class="space-y-4">
      <article v-for="r in reviews" :key="r.id" class="card p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-medium">{{ r.guestName }}</p>
            <p class="text-xs text-muted">{{ r.propertyTitle }} · {{ timeAgo(r.at) }}</p>
          </div>
          <StarRating :value="r.rating" :size="14" />
        </div>
        <p class="mt-3 text-sm leading-relaxed text-ink/85">{{ r.text }}</p>

        <div v-if="r.hostReply" class="mt-4 rounded-2xl bg-sand/60 p-4">
          <p class="label">Your reply</p>
          <p class="mt-1 text-sm">{{ r.hostReply }}</p>
        </div>
        <div v-else class="mt-4">
          <button v-if="open !== r.id" class="text-sm font-semibold text-coral hover:underline" @click="open = r.id">Reply publicly</button>
          <div v-else class="space-y-2">
            <textarea v-model="drafts[r.id]" rows="3" class="field" placeholder="Thank the guest and mention anything future guests should know…" />
            <div class="flex gap-2">
              <button class="btn-primary" @click="send(r.id)">Publish reply</button>
              <button class="btn-ghost" @click="open = null">Cancel</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
