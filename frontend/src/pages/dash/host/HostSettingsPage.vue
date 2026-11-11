<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/AppIcon.vue'

const dash = useDashboardStore()
const toast = useToast()
const saving = ref(false)

const profile = reactive({
  displayName: dash.me?.hostProfile?.displayName ?? '',
  about: dash.me?.hostProfile?.about ?? '',
  contactEmail: dash.me?.hostProfile?.contactEmail ?? dash.me?.email ?? '',
  phone: dash.me?.hostProfile?.phone ?? '',
  businessName: dash.me?.hostProfile?.businessName ?? '',
  businessType: dash.me?.hostProfile?.businessType ?? 'individual',
})

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (profile.displayName.trim().length < 2) e.displayName = 'Add the name guests will see.'
  if (profile.about.trim().length < 30) e.about = 'Write at least 30 characters so guests know what to expect.'
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(profile.contactEmail)) e.contactEmail = 'Enter a valid email address.'
  return e
})

const prefs = reactive({
  emailBookings: dash.me?.notifications.emailBookings ?? true,
  emailMessages: dash.me?.notifications.emailMessages ?? true,
  pushBookings: dash.me?.notifications.pushBookings ?? false,
  pushMessages: dash.me?.notifications.pushMessages ?? true,
  emailMarketing: dash.me?.notifications.emailMarketing ?? false,
})

const ticket = reactive({ subject: '', body: '' })

async function save(): Promise<void> {
  if (Object.keys(errors.value).length) return toast.push('Fix the highlighted fields first.', 'error')
  saving.value = true
  await dash.updateHostProfile({ ...profile, businessType: profile.businessType as 'individual' | 'company' })
  await dash.updateProfile({ notifications: { ...prefs } })
  saving.value = false
  toast.push('Host profile saved.', 'success')
}

async function createTicket(): Promise<void> {
  if (ticket.subject.trim().length < 4 || ticket.body.trim().length < 15) {
    return toast.push('Add a subject and a few sentences of detail.', 'error')
  }
  await dash.submitTicket(ticket.subject.trim(), ticket.body.trim())
  ticket.subject = ''
  ticket.body = ''
  toast.push('Support ticket created.', 'success')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="label">Hosting</p>
      <h1 class="mt-1 font-display text-3xl">Settings</h1>
      <p class="mt-1 text-sm text-muted">Guest-facing host profile, notifications and support.</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section class="space-y-6">
        <div class="card p-5">
          <p class="font-display text-lg">Host profile</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="sm:col-span-2">
              <span class="label mb-1.5 block">Public name</span>
              <input v-model="profile.displayName" class="field" :class="errors.displayName ? '!border-coral' : ''" />
              <span v-if="errors.displayName" class="mt-1 block text-xs text-coral">{{ errors.displayName }}</span>
            </label>
            <label class="sm:col-span-2">
              <span class="label mb-1.5 block">About you</span>
              <textarea v-model="profile.about" rows="4" class="field" :class="errors.about ? '!border-coral' : ''" />
              <span v-if="errors.about" class="mt-1 block text-xs text-coral">{{ errors.about }}</span>
            </label>
            <label>
              <span class="label mb-1.5 block">Contact email</span>
              <input v-model="profile.contactEmail" class="field" :class="errors.contactEmail ? '!border-coral' : ''" />
              <span v-if="errors.contactEmail" class="mt-1 block text-xs text-coral">{{ errors.contactEmail }}</span>
            </label>
            <label>
              <span class="label mb-1.5 block">Phone</span>
              <input v-model="profile.phone" class="field" placeholder="+1 555 0100" />
            </label>
            <label>
              <span class="label mb-1.5 block">Business name</span>
              <input v-model="profile.businessName" class="field" placeholder="Optional" />
            </label>
            <label>
              <span class="label mb-1.5 block">Business type</span>
              <select v-model="profile.businessType" class="field">
                <option value="individual">Individual host</option>
                <option value="company">Company</option>
              </select>
            </label>
          </div>
          <button class="btn-primary mt-5" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save changes' }}</button>
        </div>

        <div class="card p-5">
          <p class="font-display text-lg">Notifications</p>
          <div class="mt-3 space-y-3">
            <label v-for="p in [
              { key: 'emailBookings', label: 'Email me about new reservations' },
              { key: 'emailMessages', label: 'Email me about new messages' },
              { key: 'pushBookings', label: 'Push alerts for booking changes' },
              { key: 'pushMessages', label: 'Push alerts for messages' },
            ]" :key="p.key" class="flex items-center justify-between gap-4 text-sm">
              <span>{{ p.label }}</span>
              <input v-model="(prefs as any)[p.key]" type="checkbox" class="h-4 w-4 accent-coral" />
            </label>
          </div>
          <p class="mt-3 text-xs text-muted">Preferences save with the profile above.</p>
        </div>

        <div class="card p-5">
          <p class="font-display text-lg">Support</p>
          <div class="mt-3 space-y-3">
            <div v-for="t in dash.tickets" :key="t.id" class="rounded-2xl border border-line/70 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium">{{ t.subject }}</p>
                <span class="text-xs text-muted">{{ t.status }}</span>
              </div>
              <p class="mt-1 text-xs text-muted">{{ t.at }}</p>
            </div>
            <p v-if="!dash.tickets.length" class="text-sm text-muted">No tickets yet.</p>
          </div>
          <div class="mt-4 space-y-2 border-t border-line/70 pt-4">
            <input v-model="ticket.subject" class="field" placeholder="Subject" />
            <textarea v-model="ticket.body" rows="3" class="field" placeholder="How can we help?" />
            <button class="btn-ghost" @click="createTicket"><AppIcon name="mail" :size="16" /> Open ticket</button>
          </div>
        </div>
      </section>

      <aside class="space-y-4">
        <div class="card p-5">
          <p class="label">Account</p>
          <p class="mt-2 text-sm">{{ dash.me?.name }}</p>
          <p class="text-xs text-muted">{{ dash.me?.email }}</p>
          <RouterLink to="/dashboard/account" class="mt-3 inline-block text-sm font-semibold text-coral hover:underline">Open account settings</RouterLink>
        </div>
        <div class="card p-5">
          <p class="label">Host status</p>
          <p class="mt-2 text-sm font-medium capitalize">{{ dash.hostStatus }}</p>
          <p class="mt-1 text-xs text-muted">Identity verification is not available in this prototype. Statuses shown are demo values.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
