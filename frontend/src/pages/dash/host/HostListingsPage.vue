<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import EmptyState from '@/components/dash/EmptyState.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import { money } from '@/utils/format'

const dash = useDashboardStore()
const toast = useToast()
const router = useRouter()

const search = ref('')
const filter = ref<'all' | 'published' | 'draft' | 'pending' | 'rejected' | 'paused'>('all')
const busy = ref<string | null>(null)

const filters = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'pending', label: 'In review' },
  { key: 'draft', label: 'Drafts' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'paused', label: 'Paused' },
] as const

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return dash.myListings.filter((l) => {
    const matches = !q || `${l.title} ${l.city} ${l.state}`.toLowerCase().includes(q)
    const status = filter.value === 'all' || l.status === filter.value
    return matches && status
  })
})

async function submit(l: { id: string; title: string }): Promise<void> {
  busy.value = l.id
  try {
    await dash.setListingStatus(l.id, 'pending')
    toast.push(`${l.title} submitted for review.`)
  } finally {
    busy.value = null
  }
}

async function togglePause(id: string, paused: boolean): Promise<void> {
  busy.value = id
  try {
    await dash.setListingStatus(id, paused ? 'paused' : 'published')
    toast.push(paused ? 'Listing paused. It is hidden from search.' : 'Listing published again.')
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="label">Hosting</p>
        <h1 class="mt-1 font-display text-3xl text-ink">My properties</h1>
        <p class="mt-1 text-sm text-muted">New listings stay pending until the demo review approves them.</p>
      </div>
      <RouterLink to="/dashboard/host/listings/new" class="btn-primary"><AppIcon name="plus" :size="15" /> New listing</RouterLink>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-[220px] flex-1">
        <AppIcon name="search" :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="search" class="field pl-9" placeholder="Search by title, city or state" aria-label="Search listings" />
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="f in filters"
          :key="f.key"
          class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
          :class="filter === f.key ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/70 hover:border-ink/25'"
          @click="filter = f.key"
        >{{ f.label }}</button>
      </div>
    </div>

    <div v-if="rows.length" class="space-y-3">
      <article v-for="l in rows" :key="l.id" class="card overflow-hidden">
        <div class="flex flex-col gap-4 p-4 sm:flex-row">
          <img :src="l.photos[0] ?? l.photos[l.coverIndex]" :alt="l.title" class="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-32" loading="lazy" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="truncate font-semibold text-ink">{{ l.title || 'Untitled draft' }}</p>
              <StatusPill :status="l.status" />
            </div>
            <p class="mt-1 text-xs text-muted">{{ l.city || 'No city yet' }}{{ l.state ? ', ' + l.state : '' }} · {{ l.guests }} guests · {{ l.bedrooms }} bedrooms · {{ money(l.pricePerNight) }} / night</p>
            <p v-if="l.status === 'rejected' && l.rejectionReason" class="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
              <span class="font-semibold">Review feedback:</span> {{ l.rejectionReason }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <RouterLink :to="`/dashboard/host/listings/${l.id}/edit`" class="btn-ghost !px-3 !py-1.5 text-xs"><AppIcon name="edit" :size="13" /> Edit</RouterLink>
              <RouterLink
                v-if="l.status === 'published'"
                :to="`/stays/${l.slug}`"
                class="btn-ghost !px-3 !py-1.5 text-xs"
              ><AppIcon name="eye" :size="13" /> Preview</RouterLink>
              <button
                v-if="l.status === 'draft' || l.status === 'rejected'"
                class="btn-primary !px-3 !py-1.5 text-xs"
                :disabled="busy === l.id"
                @click="submit(l)"
              >{{ busy === l.id ? 'Submitting…' : 'Submit for review' }}</button>
              <button
                v-if="l.status === 'published' || l.status === 'paused'"
                class="btn-ghost !px-3 !py-1.5 text-xs"
                :disabled="busy === l.id"
                @click="togglePause(l.id, l.status === 'published')"
              >{{ l.status === 'published' ? 'Pause' : 'Resume' }}</button>
              <RouterLink :to="`/dashboard/host/calendar?listing=${l.id}`" class="btn-ghost !px-3 !py-1.5 text-xs"><AppIcon name="calendar" :size="13" /> Calendar</RouterLink>
            </div>
          </div>
        </div>
      </article>
    </div>

    <EmptyState
      v-else
      :title="search ? 'No listings match that search' : 'No properties yet'"
      body="Create your first listing, save it as a draft, then submit it for review."
      icon="home"
      action="Create a listing"
      @action="router.push('/dashboard/host/listings/new')"
    />
  </div>
</template>
