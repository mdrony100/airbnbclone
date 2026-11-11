<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number; stroke?: number }>(), { size: 20, stroke: 1.6 })

const paths: Record<string, string> = {
  wifi: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0M12 19.5h.01',
  kitchen: 'M4 4h16v6H4zM4 10v10M8 7h.01M16 7h.01M8 14h8',
  heating: 'M12 3c2 3-1 4 0 7M8 6c1.5 2-.7 3 0 5M16 6c1.5 2-.7 3 0 5M6 14h12v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z',
  ac: 'M4 5h16v8H4zM7 17c1 1 2 1 3 0M14 17c1 1 2 1 3 0M8 9h8',
  washer: 'M5 3h14v18H5zM9 7h6M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  desk: 'M3 8h18M6 8v11M18 8v11M8 12h8v4H8z',
  fire: 'M12 3c3 4 5 5.5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1.5 0 1.5-4 1-8z',
  tub: 'M4 11h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM7 11V6a2 2 0 0 1 4 0M8 21l-1 1M16 21l1 1',
  pool: 'M3 15c2 0 2 1.5 4 1.5S9 15 11 15s2 1.5 4 1.5S17 15 19 15M3 19c2 0 2 1.5 4 1.5S9 19 11 19s2 1.5 4 1.5S17 19 19 19M7 12V6a2 2 0 0 1 4 0M14 12V7a2 2 0 0 1 4 0',
  beach: 'M3 20h18M12 20V9M12 9a5 5 0 0 1 5-5M12 9a5 5 0 0 0-5-5M9 20l3-6 3 6',
  mountain: 'M3 19l6-11 4 7 2-3 6 7H3z',
  city: 'M4 20V8h6v12M10 20V4h7v16M13 8h1M13 12h1M13 16h1M6 12h2M6 16h2',
  garden: 'M12 21V11M12 11c-4 0-6-2-6-5 3 0 6 1 6 5zM12 11c4 0 6-2 6-5-3 0-6 1-6 5z',
  parking: 'M5 4h14v16H5zM10 17V8h3a3 3 0 0 1 0 6h-3',
  bbq: 'M5 5h14l-3 7H8L5 5zM12 12v5M9 21h6M8 21c0-2 1.5-3 4-3s4 1 4 3',
  firepit: 'M12 4c2.5 3 4 4 4 6a4 4 0 0 1-8 0c0-2 1.5-3 4-6zM5 19h14M7 16l-2 3M17 16l2 3',
  shower: 'M4 20h16M8 20V8a3 3 0 0 1 6 0M14 4h4M6 12h.01M9 12h.01M12 12h.01',
  tv: 'M3 6h18v10H3zM8 20l4-3 4 3',
  elevator: 'M5 3h14v18H5zM9 9l3-3 3 3M9 15l3 3 3-3',
  gym: 'M4 9v6M20 9v6M7 7v10M17 7v10M7 12h10',
  smoke: 'M12 4a6 6 0 0 1 6 6v4H6v-4a6 6 0 0 1 6-6zM9 18h6',
  co: 'M12 4a6 6 0 0 1 6 6v4H6v-4a6 6 0 0 1 6-6zM12 8v3M9 18h6',
  aid: 'M9 3h6v3h3v6h3v6h-3v3H9v-3H6v-6h3V6h3zM12 11v5M9.5 13.5h5',
  heart: 'M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9z',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3',
  calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M16.5 3.3a4 4 0 0 1 0 7.4',
  bed: 'M3 18v-8h12a4 4 0 0 1 4 4v4M3 14h16M3 18v2M21 18v2M7 10V7h5v3',
  bath: 'M4 11h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM7 11V6a2 2 0 0 1 4 0',
  home: 'M4 11l8-7 8 7v9H4zM9 20v-6h6v6',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-down': 'M5 9l7 7 7-7',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  check: 'M5 13l4 4L19 7',
  'arrow-right': 'M4 12h15M13 6l6 6-6 6',
  'arrow-left': 'M20 12H5M11 6l-6 6 6 6',
  map: 'M9 4l6 2 6-2v14l-6 2-6-2-6 2V6zM9 4v14M15 6v14',
  list: 'M4 6h16M4 12h16M4 18h16',
  filter: 'M4 6h16M7 12h10M10 18h4',
  share: 'M12 16V4M8 8l4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5',
  shield: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3zM9 12l2 2 4-4',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  key: 'M15 8a4 4 0 1 0-3.5 4L4 19v2h3v-3h2v-2h2l1-1a4 4 0 0 0 3-6z',
  leaf: 'M4 20c0-8 6-14 16-15 0 10-6 15-13 15H4zM4 20c2-4 5-7 9-9',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  tag: 'M12 3H4v8l9 9 8-8-9-9zM8 8h.01',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9h17M3.5 15h17M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 8h.01',
  alert: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  card: 'M3 7h18v10H3zM3 11h18M7 15h3',
  question: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M6 3h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  play: 'M8 5l11 7-11 7z',
  wand: 'M5 19l10-10M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 12l.8 1.6 1.7.7-1.7.7L19 16.6l-.8-1.6-1.7-.7 1.7-.7z',
  baby: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 10h.01M15 10h.01M9.5 15a3 3 0 0 0 5 0',
  dog: 'M4 10l2-5 3 2h6l3-2 2 5v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM9 14h.01M15 14h.01M12 17h.01',
  smoking: 'M3 17h13v2H3zM17 14c2 0 3-1 3-3h2c0 3-2 5-5 5M18 4v5',
}

</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="paths[name] ?? paths.info" />
  </svg>
</template>
