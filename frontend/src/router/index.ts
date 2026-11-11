import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSearchStore } from '@/stores/search'

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

router.beforeEach((to) => {
  // /search keeps its whole state in the URL, so hydrate the store from it
  if (to.name === 'search') {
    useSearchStore().hydrate(to.query as Record<string, unknown>)
  }
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'StayNest'
  document.title = title
})

export default router
