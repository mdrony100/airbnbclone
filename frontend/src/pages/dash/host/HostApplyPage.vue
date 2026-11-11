<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/AppIcon.vue'

const dash = useDashboardStore()
const toast = useToast()
const step = ref(1)
const submitting = ref(false)
const accepted = ref(false)

const hp = dash.me?.hostProfile
const form = reactive({
  displayName: hp?.displayName ?? '',
  about: hp?.about ?? '',
  contactEmail: hp?.contactEmail ?? dash.me?.email ?? '',
  phone: hp?.phone ?? '',
  businessName: hp?.businessName ?? '',
  businessType: hp?.businessType ?? 'individual',
  line1: hp?.address.line1 ?? '',
  city: hp?.address.city ?? '',
  state: hp?.address.state ?? '',
  zip: hp?.address.zip ?? '',
  payoutMethod: hp?.payout.method || 'Bank transfer (demo)',
  payoutHolder: hp?.payout.holder ?? dash.me?.name ?? '',
})

const errors = computed<Record<string, string>>(() => {
  const e: Record<string, string> = {}
  if (step.value === 1) {
    if (form.displayName.trim().length < 2) e.displayName = 'Add the name guests will see.'
    if (form.about.trim().length < 40) e.about = 'Write at least 40 characters.'
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.contactEmail)) e.contactEmail = 'Enter a valid email.'
    if (form.phone.trim().length < 6) e.phone = 'Add a phone number we can reach you on.'
  }
  if (step.value === 2) {
    if (form.line1.trim().length < 4) e.line1 = 'Street address is required.'
    if (form.city.trim().length < 2) e.city = 'City is required.'
    if (!/^[A-Za-z]{2}$/.test(form.state.trim())) e.state = 'Use the two-letter state code.'
    if (!/^\d{5}$/.test(form.zip.trim())) e.zip = 'Use a five-digit ZIP.'
  }
  if (step.value === 3) {
    if (form.payoutHolder.trim().length < 2) e.payoutHolder = 'Name on the payout account is required.'
  }
  if (step.value === 4 && !accepted.value) e.agreement = 'You must accept the host rules to continue.'
  return e
})

function next(): void {
  if (Object.keys(errors.value).length) return toast.push('Fix the highlighted fields first.', 'error')
  step.value = Math.min(4, step.value + 1)
}

async function submit(): Promise<void> {
  if (Object.keys(errors.value).length) return toast.push('Fix the highlighted fields first.', 'error')
  submitting.value = true
  await dash.submitApplication({
    displayName: form.displayName.trim(),
    about: form.about.trim(),
    contactEmail: form.contactEmail.trim(),
    phone: form.phone.trim(),
    businessName: form.businessName.trim(),
    businessType: form.businessType as 'individual' | 'company',
    address: { line1: form.line1.trim(), city: form.city.trim(), state: form.state.trim().toUpperCase(), zip: form.zip.trim() },
    payout: { status: 'pending', method: form.payoutMethod, holder: form.payoutHolder.trim(), last4: '4242', schedule: 'Weekly (demo)' },
    rulesAccepted: true,
  })
  submitting.value = false
  step.value = 1
  toast.push('Application submitted for review.', 'success')
}

async function decide(decision: 'approved' | 'rejected'): Promise<void> {
  await dash.simulateDecision(decision, decision === 'rejected' ? 'The payout account name did not match the host name.' : undefined)
  toast.push(decision === 'approved' ? 'Demo: application approved.' : 'Demo: application rejected.', decision === 'approved' ? 'success' : 'error')
}

const steps = ['Profile', 'Business', 'Payout', 'Agreement']
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="label">Hosting</p>
      <h1 class="mt-1 font-display text-3xl">Become a host</h1>
      <p class="mt-1 text-sm text-muted">One account, two modes. Apply once, then switch between traveling and hosting.</p>
    </header>

    <div v-if="dash.hostStatus === 'approved'" class="card p-6">
      <p class="font-display text-2xl">You're an approved host</p>
      <p class="mt-2 text-sm text-muted">Your application was approved{{ dash.me?.host?.decidedAt ? ` on ${dash.me?.host.decidedAt}` : '' }}. Identity checks and real payout verification are not part of this prototype.</p>
      <div class="mt-4 flex flex-wrap gap-3">
        <RouterLink to="/dashboard/host" class="btn-primary">Open host dashboard</RouterLink>
        <RouterLink to="/dashboard/host/listings" class="btn-ghost">Manage properties</RouterLink>
      </div>
    </div>

    <div v-else-if="dash.hostStatus === 'pending'" class="card p-6">
      <p class="font-display text-2xl">Application under review</p>
      <p class="mt-2 text-sm text-muted">Submitted {{ dash.me?.host.submittedAt }}. Reviews in this prototype are simulated.</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-ghost" @click="decide('approved')">Simulate approval</button>
        <button class="btn-ghost" @click="decide('rejected')">Simulate rejection</button>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div v-if="dash.hostStatus === 'rejected'" class="card border-coral/40 p-5">
        <p class="font-display text-lg text-coral-dark">Application rejected</p>
        <p class="mt-1 text-sm text-ink/80">{{ dash.me?.host.rejectionReason }}</p>
        <p class="mt-2 text-xs text-muted">Update the details below and resubmit.</p>
      </div>

      <div class="card p-6">
        <ol class="flex flex-wrap gap-2 text-xs font-semibold">
          <li v-for="(s, i) in steps" :key="s" class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-full"
                  :class="step > i + 1 ? 'bg-ink text-white' : step === i + 1 ? 'bg-coral text-white' : 'bg-sand text-muted'">{{ i + 1 }}</span>
            <span :class="step === i + 1 ? 'text-ink' : 'text-muted'">{{ s }}</span>
            <span v-if="i < steps.length - 1" class="mx-1 h-px w-6 bg-line" />
          </li>
        </ol>

        <div v-if="step === 1" class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="sm:col-span-2">
            <span class="label mb-1.5 block">Public name</span>
            <input v-model="form.displayName" class="field" :class="errors.displayName ? '!border-coral' : ''" placeholder="Marisol Vega" />
            <span v-if="errors.displayName" class="mt-1 block text-xs text-coral">{{ errors.displayName }}</span>
          </label>
          <label class="sm:col-span-2">
            <span class="label mb-1.5 block">About you</span>
            <textarea v-model="form.about" rows="4" class="field" :class="errors.about ? '!border-coral' : ''" placeholder="Tell guests who you are and how you host." />
            <span v-if="errors.about" class="mt-1 block text-xs text-coral">{{ errors.about }}</span>
          </label>
          <label>
            <span class="label mb-1.5 block">Contact email</span>
            <input v-model="form.contactEmail" class="field" :class="errors.contactEmail ? '!border-coral' : ''" />
            <span v-if="errors.contactEmail" class="mt-1 block text-xs text-coral">{{ errors.contactEmail }}</span>
          </label>
          <label>
            <span class="label mb-1.5 block">Phone</span>
            <input v-model="form.phone" class="field" :class="errors.phone ? '!border-coral' : ''" placeholder="+1 555 0100" />
            <span v-if="errors.phone" class="mt-1 block text-xs text-coral">{{ errors.phone }}</span>
          </label>
        </div>

        <div v-else-if="step === 2" class="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span class="label mb-1.5 block">Business name</span>
            <input v-model="form.businessName" class="field" placeholder="Optional" />
          </label>
          <label>
            <span class="label mb-1.5 block">Business type</span>
            <select v-model="form.businessType" class="field">
              <option value="individual">Individual host</option>
              <option value="company">Company</option>
            </select>
          </label>
          <label class="sm:col-span-2">
            <span class="label mb-1.5 block">Mailing address</span>
            <input v-model="form.line1" class="field" :class="errors.line1 ? '!border-coral' : ''" placeholder="Street address" />
            <span v-if="errors.line1" class="mt-1 block text-xs text-coral">{{ errors.line1 }}</span>
          </label>
          <label>
            <span class="label mb-1.5 block">City</span>
            <input v-model="form.city" class="field" :class="errors.city ? '!border-coral' : ''" />
            <span v-if="errors.city" class="mt-1 block text-xs text-coral">{{ errors.city }}</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label>
              <span class="label mb-1.5 block">State</span>
              <input v-model="form.state" maxlength="2" class="field uppercase" :class="errors.state ? '!border-coral' : ''" placeholder="CA" />
              <span v-if="errors.state" class="mt-1 block text-xs text-coral">{{ errors.state }}</span>
            </label>
            <label>
              <span class="label mb-1.5 block">ZIP</span>
              <input v-model="form.zip" maxlength="5" class="field" :class="errors.zip ? '!border-coral' : ''" placeholder="93920" />
              <span v-if="errors.zip" class="mt-1 block text-xs text-coral">{{ errors.zip }}</span>
            </label>
          </div>
        </div>

        <div v-else-if="step === 3" class="mt-6 space-y-4">
          <p class="text-sm text-muted">Payout setup is simulated. No bank details are collected or stored.</p>
          <label>
            <span class="label mb-1.5 block">Payout method</span>
            <select v-model="form.payoutMethod" class="field">
              <option>Bank transfer (demo)</option>
              <option>Stripe Connect (demo)</option>
            </select>
          </label>
          <label>
            <span class="label mb-1.5 block">Name on account</span>
            <input v-model="form.payoutHolder" class="field" :class="errors.payoutHolder ? '!border-coral' : ''" />
            <span v-if="errors.payoutHolder" class="mt-1 block text-xs text-coral">{{ errors.payoutHolder }}</span>
          </label>
        </div>

        <div v-else class="mt-6 space-y-4">
          <div class="rounded-2xl bg-sand/60 p-4 text-sm">
            <p><span class="text-muted">Name:</span> {{ form.displayName }}</p>
            <p class="mt-1"><span class="text-muted">Contact:</span> {{ form.contactEmail }} · {{ form.phone }}</p>
            <p class="mt-1"><span class="text-muted">Address:</span> {{ form.line1 }}, {{ form.city }}, {{ form.state }} {{ form.zip }}</p>
            <p class="mt-1"><span class="text-muted">Payout:</span> {{ form.payoutMethod }} · {{ form.payoutHolder }}</p>
          </div>
          <label class="flex items-start gap-3 text-sm">
            <input v-model="accepted" type="checkbox" class="mt-0.5 h-4 w-4 accent-coral" />
            <span>I agree to the host rules, cancellation standards and guest communication expectations.</span>
          </label>
          <p v-if="errors.agreement" class="text-xs text-coral">{{ errors.agreement }}</p>
          <p class="text-xs text-muted">Approval is simulated in this prototype. New listings stay pending until approved.</p>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <button class="btn-ghost" :disabled="step === 1" @click="step--">Back</button>
          <button v-if="step < 4" class="btn-primary" @click="next">Continue <AppIcon name="chevron-right" :size="15" /></button>
          <button v-else class="btn-primary" :disabled="submitting" @click="submit">{{ submitting ? 'Submitting…' : 'Submit application' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
