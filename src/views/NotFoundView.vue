<script setup>
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <section class="not-found">
    <div class="not-found-art"><i class="pi pi-map"></i><span>404</span></div>
    <span class="section-overline">GEOMINE / 404</span>
    <h1>{{ t('notFoundTitle') }}</h1>
    <p>{{ t('notFoundDescription') }} <code>{{ route.fullPath }}</code>.</p>
    <Button :label="t('returnHome')" icon="pi pi-arrow-left" @click="router.push('/home')" />
  </section>
</template>
