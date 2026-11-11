import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue'), meta: { title: 'StayNest — Vacation rentals across the United States' } },
  { path: '/search', name: 'search', component: () => import('@/pages/SearchPage.vue'), meta: { title: 'Search stays — StayNest' } },
  { path: '/stays/:slug', name: 'property', component: () => import('@/pages/PropertyPage.vue') },
  { path: '/checkout/:slug', name: 'checkout', component: () => import('@/pages/CheckoutPage.vue'), meta: { title: 'Confirm and pay — StayNest' } },
  { path: '/booking/processing', name: 'booking-processing', component: () => import('@/pages/BookingProcessingPage.vue'), meta: { title: 'Processing your booking — StayNest' } },
  { path: '/booking/:code/success', name: 'booking-success', component: () => import('@/pages/BookingSuccessPage.vue'), meta: { title: 'Booking confirmed — StayNest' } },
  { path: '/booking/:code/failed', name: 'booking-failed', component: () => import('@/pages/BookingFailedPage.vue'), meta: { title: 'Payment failed — StayNest' } },
  { path: '/wishlist', name: 'wishlist', component: () => import('@/pages/WishlistPage.vue'), meta: { title: 'Your wishlist — StayNest' } },
  { path: '/host', name: 'host', component: () => import('@/pages/HostPage.vue'), meta: { title: 'Become a host — StayNest' } },
  { path: '/about', name: 'about', component: () => import('@/pages/AboutPage.vue'), meta: { title: 'About StayNest' } },
  { path: '/contact', name: 'contact', component: () => import('@/pages/ContactPage.vue'), meta: { title: 'Contact StayNest' } },
  { path: '/help', name: 'help', component: () => import('@/pages/HelpPage.vue'), meta: { title: 'Help and FAQ — StayNest' } },
  { path: '/terms', name: 'terms', component: () => import('@/pages/TermsPage.vue'), meta: { title: 'Terms of service — StayNest' } },
  { path: '/privacy', name: 'privacy', component: () => import('@/pages/PrivacyPage.vue'), meta: { title: 'Privacy policy — StayNest' } },
  { path: '/cancellation-policy', name: 'cancellation', component: () => import('@/pages/CancellationPage.vue'), meta: { title: 'Cancellation policy — StayNest' } },
  { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue'), meta: { title: 'Log in — StayNest' } },
  { path: '/register', name: 'register', component: () => import('@/pages/RegisterPage.vue'), meta: { title: 'Create an account — StayNest' } },
  { path: '/forgot-password', name: 'forgot', component: () => import('@/pages/ForgotPasswordPage.vue'), meta: { title: 'Reset your password — StayNest' } },
  { path: '/reset-password', name: 'reset', component: () => import('@/pages/ResetPasswordPage.vue'), meta: { title: 'Choose a new password — StayNest' } },
  { path: '/verify-email', name: 'verify', component: () => import('@/pages/VerifyEmailPage.vue'), meta: { title: 'Verify your email — StayNest' } },
  // ---------------------------------------------------------------------------
  // Customer dashboard. Guest and host modes share one signed-in account.
  // Client-side guards only shape the demo; the Laravel API must authorize every
  // request server-side (see docs/api-contract.md, "Authorization").
  // ---------------------------------------------------------------------------
  {
    path: '/dashboard',
    component: () => import('@/components/dash/DashboardLayout.vue'),
    meta: { requiresAccount: true, title: 'Your dashboard — StayNest' },
    children: [
      { path: '', name: 'dash-home', component: () => import('@/pages/dash/OverviewPage.vue'), meta: { title: 'Overview — StayNest' } },
      { path: 'trips', name: 'dash-trips', component: () => import('@/pages/dash/TripsPage.vue'), meta: { title: 'My trips — StayNest' } },
      { path: 'trips/:code', name: 'dash-trip', component: () => import('@/pages/dash/TripDetailPage.vue'), meta: { title: 'Trip details — StayNest' } },
      { path: 'wishlists', name: 'dash-wishlists', component: () => import('@/pages/dash/WishlistsPage.vue'), meta: { title: 'Wishlists — StayNest' } },
      { path: 'messages', name: 'dash-messages', component: () => import('@/pages/dash/MessagesPage.vue'), meta: { title: 'Messages — StayNest' } },
      { path: 'messages/:id', name: 'dash-message', component: () => import('@/pages/dash/MessagesPage.vue'), meta: { title: 'Messages — StayNest' } },
      { path: 'reviews', name: 'dash-reviews', component: () => import('@/pages/dash/ReviewsPage.vue'), meta: { title: 'Reviews — StayNest' } },
      { path: 'account', name: 'dash-account', component: () => import('@/pages/dash/AccountPage.vue'), meta: { title: 'Account — StayNest' } },
      { path: 'host', name: 'host-home', component: () => import('@/pages/dash/host/HostOverviewPage.vue'), meta: { title: 'Hosting overview — StayNest' } },
      { path: 'host/apply', name: 'host-apply', component: () => import('@/pages/dash/host/HostApplyPage.vue'), meta: { title: 'Become a host — StayNest' } },
      { path: 'host/listings', name: 'host-listings', component: () => import('@/pages/dash/host/HostListingsPage.vue'), meta: { title: 'My properties — StayNest', requiresHost: true } },
      { path: 'host/listings/new', name: 'host-listing-new', component: () => import('@/pages/dash/host/HostListingEditorPage.vue'), meta: { title: 'New property — StayNest', requiresHost: true } },
      { path: 'host/listings/:id/edit', name: 'host-listing-edit', component: () => import('@/pages/dash/host/HostListingEditorPage.vue'), meta: { title: 'Edit property — StayNest', requiresHost: true } },
      { path: 'host/calendar', name: 'host-calendar', component: () => import('@/pages/dash/host/HostCalendarPage.vue'), meta: { title: 'Calendar — StayNest', requiresHost: true } },
      { path: 'host/reservations', name: 'host-reservations', component: () => import('@/pages/dash/host/HostReservationsPage.vue'), meta: { title: 'Reservations — StayNest', requiresHost: true } },
      { path: 'host/reservations/:code', name: 'host-reservation', component: () => import('@/pages/dash/host/HostReservationDetailPage.vue'), meta: { title: 'Reservation — StayNest', requiresHost: true } },
      { path: 'host/earnings', name: 'host-earnings', component: () => import('@/pages/dash/host/HostEarningsPage.vue'), meta: { title: 'Earnings — StayNest', requiresHost: true } },
      { path: 'host/reviews', name: 'host-reviews', component: () => import('@/pages/dash/host/HostReviewsPage.vue'), meta: { title: 'Host reviews — StayNest', requiresHost: true } },
      { path: 'host/settings', name: 'host-settings', component: () => import('@/pages/dash/host/HostSettingsPage.vue'), meta: { title: 'Host settings — StayNest' } },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue'), meta: { title: 'Page not found — StayNest' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (to.name === from.name && to.name === 'search') return false
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  // /search keeps its whole state in the URL, so hydrate the store from it
  if (to.name === 'search') {
    useSearchStore().hydrate(to.query as Record<string, unknown>)
  }

  if (to.matched.some((r) => r.meta.requiresAccount)) {
    const auth = useAuthStore()
    const dash = useDashboardStore()
    if (!auth.accountId) {
      return { path: '/login', query: { next: to.fullPath } }
    }
    if (!dash.accounts.length) await dash.load(auth.accountId)
    if (to.matched.some((r) => r.meta.requiresHost) && dash.hostStatus !== 'approved') {
      return { path: '/dashboard/host/apply' }
    }
  }
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'StayNest'
  document.title = title
})

export default router
