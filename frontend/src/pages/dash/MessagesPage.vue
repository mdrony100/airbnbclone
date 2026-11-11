<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useDashboardStore } from '@/stores/dashboard'
import type { Conversation } from '@/types/dashboard'
import { lastOf, timeAgo } from '@/utils/format'

const dash = useDashboardStore()
const route = useRoute()
const router = useRouter()
const draft = ref('')
const sending = ref(false)
const listEl = ref<HTMLElement | null>(null)

const role = computed<'guest' | 'host'>(() => (dash.mode === 'hosting' ? 'host' : 'guest'))
const conversations = computed<Conversation[]>(() =>
  (role.value === 'host' ? dash.hostConversations : dash.guestConversations)
    .slice()
    .sort((a, b) => (lastOf(b.messages)?.at ?? '').localeCompare(lastOf(a.messages)?.at ?? '')))

const activeId = computed(() => (route.params.id as string) ?? conversations.value[0]?.id ?? '')
const active = computed(() => conversations.value.find((c) => c.id === activeId.value) ?? null)
const unread = (c: Conversation): number =>
  role.value === 'host'
    ? c.messages.filter((m) => m.from === 'guest' && !m.readByHost).length
    : c.messages.filter((m) => m.from !== 'guest' && !m.readByGuest).length

async function open(id: string): Promise<void> {
  router.push(`/dashboard/messages/${id}`)
  await dash.markConversationRead(id)
  await scrollToEnd()
}

async function scrollToEnd(): Promise<void> {
  await nextTick()
  if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
}

async function send(): Promise<void> {
  const body = draft.value.trim()
  if (!body || !active.value || sending.value) return
  sending.value = true
  try {
    await dash.sendMessage(active.value.id, body)
    draft.value = ''
    await scrollToEnd()
  } finally {
    sending.value = false
  }
}

watch(activeId, async (id) => {
  if (id) await dash.markConversationRead(id)
  await scrollToEnd()
}, { immediate: true })
</script>

<template>
  <div class="space-y-5">
    <header>
      <p class="label">{{ role === 'host' ? 'Hosting' : 'Guest' }}</p>
      <h1 class="mt-1 font-display text-3xl text-ink">Messages</h1>
      <p class="mt-1 text-sm text-muted">Threads are tied to a reservation. The same conversation is visible from both sides of a booking.</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside class="card divide-y divide-line overflow-hidden" aria-label="Conversations">
        <button
          v-for="c in conversations"
          :key="c.id"
          class="flex w-full items-start gap-3 p-3 text-left transition hover:bg-sand/50"
          :class="c.id === activeId ? 'bg-sand/70' : ''"
          @click="open(c.id)"
        >
          <img :src="c.propertyPhoto" :alt="c.propertyTitle" class="h-11 w-11 shrink-0 rounded-xl object-cover" loading="lazy" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-ink">{{ role === 'host' ? c.guestName : c.hostName }}</p>
            <p class="truncate text-xs text-muted">{{ c.propertyTitle }}</p>
            <p class="mt-0.5 truncate text-xs text-ink/60">{{ lastOf(c.messages)?.body }}</p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <span class="text-[10px] text-muted">{{ timeAgo(lastOf(c.messages)?.at ?? '') }}</span>
            <span v-if="unread(c)" class="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{{ unread(c) }}</span>
          </div>
        </button>
        <p v-if="!conversations.length" class="p-6 text-center text-sm text-muted">No conversations yet.</p>
      </aside>

      <section v-if="active" class="card flex min-h-[520px] flex-col overflow-hidden">
        <header class="flex items-center justify-between gap-3 border-b border-line p-4">
          <div class="flex min-w-0 items-center gap-3">
            <img :src="active.propertyPhoto" :alt="active.propertyTitle" class="h-10 w-10 rounded-xl object-cover" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">{{ role === 'host' ? active.guestName : active.hostName }}</p>
              <p class="truncate text-xs text-muted">{{ active.propertyTitle }}</p>
            </div>
          </div>
          <RouterLink
            :to="role === 'host' ? `/dashboard/host/reservations/${active.reservationCode}` : `/dashboard/trips/${active.reservationCode}`"
            class="shrink-0 text-xs font-semibold text-coral hover:underline"
          >View reservation</RouterLink>
        </header>

        <div ref="listEl" class="flex-1 space-y-3 overflow-y-auto bg-paper/60 p-4">
          <div
            v-for="m in active.messages"
            :key="m.id"
            class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm"
            :class="[
              m.from === 'support' ? 'mx-auto w-full max-w-none border border-dashed border-line bg-white text-center text-xs text-muted' : '',
              m.from === role ? 'ml-auto bg-ink text-white' : m.from === 'guest' ? 'bg-white text-ink' : 'bg-sand text-ink',
            ]"
          >
            <p v-if="m.from !== 'support'" class="mb-1 text-[11px] opacity-70">{{ m.authorName }}</p>
            <p class="whitespace-pre-line">{{ m.body }}</p>
            <p v-if="m.from !== 'support'" class="mt-1 text-[10px] opacity-60">{{ timeAgo(m.at) }}</p>
          </div>
        </div>

        <form class="border-t border-line p-3" @submit.prevent="send">
          <label class="sr-only" for="draft">Message</label>
          <div class="flex items-end gap-2">
            <textarea
              id="draft"
              v-model="draft"
              rows="2"
              class="field min-h-[52px] flex-1 resize-none"
              placeholder="Write a message about this stay…"
              @keydown.enter.exact.prevent="send"
            />
            <button class="btn-primary shrink-0" :disabled="!draft.trim() || sending">
              <AppIcon name="play" :size="15" /> <span class="hidden sm:inline">Send</span>
            </button>
          </div>
          <p class="mt-1 text-[11px] text-muted">Demo messaging. No email is sent and nobody outside this prototype receives it.</p>
        </form>
      </section>

      <section v-else class="card flex items-center justify-center p-10 text-sm text-muted">Select a conversation to read it.</section>
    </div>
  </div>
</template>
