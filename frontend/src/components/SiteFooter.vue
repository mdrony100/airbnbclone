<script setup lang="ts">
import AppLogo from './AppLogo.vue'
</script>

<template>
  <footer class="mt-24 border-t border-line bg-sand/60">
    <div class="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
      <div class="lg:col-span-2">
        <AppLogo />
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-muted">
          Handpicked vacation rentals across the United States. Clear pricing, honest listings, no surprises at checkout.
        </p>
        <p class="mt-6 max-w-xs rounded-2xl border border-line bg-paper/80 p-3 text-xs leading-relaxed text-muted">
          Demo build for milestone 1. Listings, reviews and prices are fictional, and checkout is simulated. No payment is taken.
        </p>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Explore</h3>
        <ul class="mt-4 space-y-2.5 text-sm text-muted">
          <li><RouterLink to="/search" class="hover:text-ink">All stays</RouterLink></li>
          <li><RouterLink to="/search?types=cabin" class="hover:text-ink">Cabins</RouterLink></li>
          <li><RouterLink to="/search?types=beachhouse" class="hover:text-ink">Beach houses</RouterLink></li>
          <li><RouterLink to="/search?types=villa" class="hover:text-ink">Villas</RouterLink></li>
          <li><RouterLink to="/wishlist" class="hover:text-ink">Wishlist</RouterLink></li>
        </ul>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Hosting</h3>
        <ul class="mt-4 space-y-2.5 text-sm text-muted">
          <li><RouterLink to="/host" class="hover:text-ink">Become a host</RouterLink></li>
          <li><RouterLink to="/help" class="hover:text-ink">Host resources</RouterLink></li>
          <li><RouterLink to="/contact" class="hover:text-ink">Contact us</RouterLink></li>
        </ul>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Company</h3>
        <ul class="mt-4 space-y-2.5 text-sm text-muted">
          <li><RouterLink to="/about" class="hover:text-ink">About</RouterLink></li>
          <li><RouterLink to="/help" class="hover:text-ink">Help centre</RouterLink></li>
          <li><RouterLink to="/terms" class="hover:text-ink">Terms</RouterLink></li>
          <li><RouterLink to="/privacy" class="hover:text-ink">Privacy</RouterLink></li>
          <li><RouterLink to="/cancellation-policy" class="hover:text-ink">Cancellation policy</RouterLink></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-line/80">
      <div class="shell flex flex-col gap-3 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ new Date().getFullYear() }} StayNest. Demo project, not a real booking service.</p>
        <p class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-coral" />
          United States · USD · English
        </p>
      </div>
    </div>
  </footer>
</template>
