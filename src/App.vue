<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopNav from './components/icons/TopNav.vue'
import { navLinks } from '@/data/navigation'
</script>

<template>
  <TopNav :data="navLinks" />
  <div><RouterView /></div>
</template>
