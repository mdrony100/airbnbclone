<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import { dateLong, timeAgo } from '@/utils/format'

const dash = useDashboardStore()
const toast = useToast()

const name = ref(dash.me?.name ?? '')
const phone = ref(dash.me?.phone ?? '')
const savingProfile = ref(false)
const profileError = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSaved = ref(false)

const ticketSubject = ref('')
const ticketBody = ref('')
const ticketError = ref('')
const ticketSaving = ref(false)

const prefs = computed(() => dash.me?.notifications)

async function saveProfile(): Promise<void> {
  profileError.value = ''
  if (name.value.trim().length < 2) { profileError.value = 'Please enter your full name.'; return }
  savingProfile.value = true
  try {
    await dash.updateProfile({ name: name.value.trim(), phone: phone.value.trim() })
    toast.push('Profile updated.')
  } catch {
    profileError.value = 'We could not save your profile.'
  } finally {
    savingProfile.value = false
  }
}

async function savePassword(): Promise<void> {
  passwordError.value = ''
  passwordSaved.value = false
  if (newPassword.value.length < 8) { passwordError.value = 'Use at least 8 characters.'; return }
  if (newPassword.value !== confirmPassword.value) { passwordError.value = 'The two passwords do not match.'; return }
  passwordSaved.value = true
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  toast.push('Demo password change recorded. No real credential is stored.')
}

async function togglePref(key: keyof NonNullable<typeof prefs.value>): Promise<void> {
  if (!prefs.value) return
  await dash.updateProfile({ notifications: { ...prefs.value, [key]: !prefs.value[key] } })
}

async function submitTicket(): Promise<void> {
  ticketError.value = ''
  if (ticketSubject.value.trim().length < 4) { ticketError.value = 'Add a short subject.'; return }
  if (ticketBody.value.trim().length < 15) { ticketError.value = 'Describe the issue in a sentence or two.'; return }
  ticketSaving.value = true
  try {
    await dash.submitTicket(ticketSubject.value.trim(), ticketBody.value.trim())
    ticketSubject.value = ''
    ticketBody.value = ''
    toast.push('Support ticket created.')
  } finally {
    ticketSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="label">Account</p>
      <h1 class="mt-1 font-display text-3xl text-ink">Your account</h1>
      <p class="mt-1 text-sm text-muted">One account for travelling and hosting. Authentication here is simulated.</p>
    </header>

    <section class="card p-5">
      <div class="flex flex-wrap items-center gap-4">
        <span class="grid h-16 w-16 place-items-center rounded-full bg-coral/15 font-display text-xl text-coral">{{ dash.me?.initials }}</span>
        <div class="min-w-0">
          <p class="font-display text-xl text-ink">{{ dash.me?.name }}</p>
          <p class="text-sm text-muted">{{ dash.me?.email }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <StatusPill :status="dash.me?.verified ? 'approved' : 'pending'" :label="dash.me?.verified ? 'Email verified' : 'Email unverified'" />
            <span class="text-xs text-muted">Member since {{ dash.me ? dateLong(dash.me.joined) : '' }}</span>
          </div>
        </div>
      </div>

      <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
        <div>
          <label class="label" for="acc-name">Full name</label>
          <input id="acc-name" v-model="name" class="field mt-1" autocomplete="name" />
        </div>
        <div>
          <label class="label" for="acc-phone">Phone</label>
          <input id="acc-phone" v-model="phone" class="field mt-1" autocomplete="tel" />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="acc-email">Email</label>
          <input id="acc-email" :value="dash.me?.email" class="field mt-1 bg-sand/50" readonly />
          <p class="mt-1 text-[11px] text-muted">Email changes need re-verification and are out of scope for milestone 2.</p>
        </div>
        <p v-if="profileError" class="text-sm text-coral sm:col-span-2">{{ profileError }}</p>
        <div class="sm:col-span-2">
          <button class="btn-primary" :disabled="savingProfile">{{ savingProfile ? 'Saving…' : 'Save profile' }}</button>
        </div>
      </form>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card p-5">
        <h2 class="font-display text-lg text-ink">Password</h2>
        <p class="mt-1 text-xs text-muted">Demo only: nothing is stored and no email is sent.</p>
        <form class="mt-3 space-y-3" @submit.prevent="savePassword">
          <div>
            <label class="label" for="pw-current">Current password</label>
            <input id="pw-current" v-model="currentPassword" type="password" class="field mt-1" autocomplete="current-password" />
          </div>
          <div>
            <label class="label" for="pw-new">New password</label>
            <input id="pw-new" v-model="newPassword" type="password" class="field mt-1" autocomplete="new-password" />
          </div>
          <div>
            <label class="label" for="pw-confirm">Confirm new password</label>
            <input id="pw-confirm" v-model="confirmPassword" type="password" class="field mt-1" autocomplete="new-password" />
          </div>
          <p v-if="passwordError" class="text-sm text-coral">{{ passwordError }}</p>
          <p v-if="passwordSaved" class="text-sm text-emerald-700">Password change recorded for this demo.</p>
          <button class="btn-primary">Update password</button>
        </form>
      </section>

      <section class="card p-5">
        <h2 class="font-display text-lg text-ink">Notifications</h2>
        <ul class="mt-3 space-y-2">
          <li v-for="item in [
            { key: 'emailBookings', label: 'Booking emails' },
            { key: 'emailMessages', label: 'Message emails' },
            { key: 'emailMarketing', label: 'Occasional inspiration emails' },
            { key: 'pushBookings', label: 'Push: booking updates' },
            { key: 'pushMessages', label: 'Push: new messages' },
          ]" :key="item.key" class="flex items-center justify-between gap-3 rounded-xl px-1 py-1.5">
            <span class="text-sm text-ink">{{ item.label }}</span>
            <button
              class="relative h-6 w-11 shrink-0 rounded-full transition"
              :class="prefs?.[item.key as keyof typeof prefs] ? 'bg-ink' : 'bg-line'"
              role="switch"
              :aria-checked="Boolean(prefs?.[item.key as keyof typeof prefs])"
              :aria-label="item.label"
              @click="togglePref(item.key as keyof NonNullable<typeof prefs>)"
            >
              <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" :class="prefs?.[item.key as keyof typeof prefs] ? 'left-[22px]' : 'left-0.5'" />
            </button>
          </li>
        </ul>
      </section>
    </div>

    <section class="card p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-display text-lg text-ink">Hosting</h2>
        <RouterLink to="/dashboard/host/apply" class="text-sm font-semibold text-coral hover:underline">Host application</RouterLink>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <StatusPill :status="dash.me?.host.status ?? 'none'" :label="dash.me?.host.status === 'none' ? 'Not a host yet' : undefined" />
        <p class="text-sm text-muted">
          {{ dash.me?.host.status === 'approved'
            ? 'Approved. Switch to hosting from the sidebar to manage listings.'
            : dash.me?.host.status === 'pending'
              ? 'Application submitted and waiting for the demo review.'
              : dash.me?.host.status === 'rejected'
                ? dash.me?.host.rejectionReason ?? 'Application needs changes.'
                : 'Apply to host, then switch modes whenever you like.' }}
        </p>
      </div>
    </section>

    <section class="card p-5">
      <h2 class="font-display text-lg text-ink">Support requests</h2>
      <div class="mt-3 space-y-3">
        <article v-for="t in dash.tickets" :key="t.id" class="rounded-xl border border-line p-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-semibold text-ink">{{ t.subject }}</p>
            <StatusPill :status="t.status === 'open' ? 'pending' : t.status === 'answered' ? 'approved' : 'draft'" :label="t.status" />
          </div>
          <p class="mt-1 text-xs text-muted">{{ timeAgo(t.at) }}</p>
          <p class="mt-2 text-sm text-ink/80">{{ t.body }}</p>
          <p v-if="t.reply" class="mt-2 rounded-lg bg-sand/70 p-2 text-sm"><span class="font-semibold">Support:</span> {{ t.reply }}</p>
        </article>
        <p v-if="!dash.tickets.length" class="text-sm text-muted">No tickets yet.</p>
      </div>

      <form class="mt-4 space-y-3 border-t border-line pt-4" @submit.prevent="submitTicket">
        <div>
          <label class="label" for="ticket-subject">New request</label>
          <input id="ticket-subject" v-model="ticketSubject" class="field mt-1" placeholder="What do you need help with?" />
        </div>
        <div>
          <label class="label" for="ticket-body">Details</label>
          <textarea id="ticket-body" v-model="ticketBody" rows="3" class="field mt-1" placeholder="Add the reservation code or the listing name if relevant." />
        </div>
        <p v-if="ticketError" class="text-sm text-coral">{{ ticketError }}</p>
        <button class="btn-ghost" :disabled="ticketSaving">{{ ticketSaving ? 'Sending…' : 'Send to support' }}</button>
      </form>
    </section>
  </div>
</template>
