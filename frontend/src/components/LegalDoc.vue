<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; updated: string; sections: { h: string; p: string[] }[] }>()
</script>

<template>
  <div>
    <header class="shell pb-6 pt-10 sm:pt-14">
      <p class="label">{{ eyebrow }}</p>
      <h1 class="mt-2 max-w-3xl font-display text-4xl leading-[1.08] sm:text-5xl">{{ title }}</h1>
      <p class="mt-3 text-sm text-muted">Last updated {{ updated }}</p>
      <p class="mt-4 inline-flex max-w-2xl items-start gap-2 rounded-2xl border border-coral/30 bg-coral-soft p-3 text-xs leading-relaxed text-coral-dark">
        <span aria-hidden="true">⚑</span>
        Draft copy for review. This document is placeholder legal text written for the demo build and must be reviewed by a qualified lawyer before launch.
      </p>
    </header>
    <div class="shell grid gap-10 pb-16 lg:grid-cols-[16rem_1fr] lg:items-start">
      <nav class="hidden lg:sticky lg:top-24 lg:block" aria-label="On this page">
        <p class="label mb-3">On this page</p>
        <ol class="space-y-2 text-sm text-muted">
          <li v-for="(s, i) in sections" :key="s.h">
            <a :href="`#s-${i}`" class="hover:text-ink">{{ i + 1 }}. {{ s.h }}</a>
          </li>
        </ol>
      </nav>
      <article class="max-w-2xl">
        <section v-for="(s, i) in sections" :id="`s-${i}`" :key="s.h" class="scroll-mt-24 border-b border-line py-6 first:pt-0">
          <h2 class="font-display text-xl">{{ i + 1 }}. {{ s.h }}</h2>
          <p v-for="(para, j) in s.p" :key="j" class="mt-2.5 text-sm leading-relaxed text-muted">{{ para }}</p>
        </section>
        <p class="mt-8 text-xs text-muted">
          Questions about this document? <RouterLink to="/contact" class="link-underline">Contact us</RouterLink>.
        </p>
      </article>
    </div>
  </div>
</template>
