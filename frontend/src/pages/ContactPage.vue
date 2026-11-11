<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useToast } from '@/composables/useToast'

const { push } = useToast()
const name = ref('')
const email = ref('')
const topic = ref('Booking')
const message = ref('')
const errors = ref<Record<string, string>>({})
const sent = ref(false)

function submit(): void {
  const e: Record<string, string> = {}
  if (!name.value.trim()) e.name = 'Add your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value)) e.email = 'Add a valid email.'
  if (message.value.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).'
  errors.value = e
  if (Object.keys(e).length) return
  sent.value = true
  push('Message recorded (demo)')
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Support" title="Talk to a person" lead="Questions about a booking, a listing or hosting? Send a message and we will reply by email." />
    <div class="shell grid gap-10 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div class="rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
        <div v-if="sent" class="rounded-2xl bg-sand/70 p-5 text-sm text-muted">
          <p class="font-semibold text-ink">Thanks {{ name }} — message recorded.</p>
          <p class="mt-1">This demo has no mail server, so nothing was actually sent. In the live product this form posts to the support inbox.</p>
        </div>
        <form v-else class="space-y-4" @submit.prevent="submit">
          <div class="grid gap-4 sm:grid-cols-2">
            <label>
              <span class="label mb-2 block">Name</span>
              <input v-model="name" class="field" :class="errors.name ? '!border-coral' : ''" />
              <span v-if="errors.name" class="mt-1 block text-xs text-coral">{{ errors.name }}</span>
            </label>
            <label>
              <span class="label mb-2 block">Email</span>
              <input v-model="email" type="email" class="field" :class="errors.email ? '!border-coral' : ''" />
              <span v-if="errors.email" class="mt-1 block text-xs text-coral">{{ errors.email }}</span>
            </label>
          </div>
          <label class="block">
            <span class="label mb-2 block">Topic</span>
            <select v-model="topic" class="field">
              <option>Booking</option>
              <option>Cancellation</option>
              <option>Payments</option>
              <option>Hosting</option>
              <option>Something else</option>
            </select>
          </label>
          <label class="block">
            <span class="label mb-2 block">Message</span>
            <textarea v-model="message" rows="5" class="field resize-none" :class="errors.message ? '!border-coral' : ''" placeholder="Include the booking reference if you have one." />
            <span v-if="errors.message" class="mt-1 block text-xs text-coral">{{ errors.message }}</span>
          </label>
          <button class="btn-primary">Send message</button>
        </form>
      </div>

      <aside class="space-y-4">
        <div class="rounded-card border border-line bg-white p-6">
          <h2 class="font-display text-lg">Faster answers</h2>
          <ul class="mt-3 space-y-3 text-sm text-muted">
            <li class="flex gap-2.5"><AppIcon name="question" :size="16" class="mt-0.5 text-coral" /> Most questions are answered in the <RouterLink to="/help" class="link-underline text-ink">help centre</RouterLink>.</li>
            <li class="flex gap-2.5"><AppIcon name="clock" :size="16" class="mt-0.5 text-coral" /> We reply to messages within one business day.</li>
            <li class="flex gap-2.5"><AppIcon name="shield" :size="16" class="mt-0.5 text-coral" /> Never send card details by email.</li>
          </ul>
        </div>
        <div class="rounded-card border border-line bg-sand/50 p-6 text-sm text-muted">
          <p class="font-semibold text-ink">Demo notice</p>
          <p class="mt-1.5 leading-relaxed">This contact form is part of the milestone 1 demonstration. Messages are validated and acknowledged, but not delivered.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
