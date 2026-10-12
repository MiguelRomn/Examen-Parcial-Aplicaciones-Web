<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Button from 'primevue/button'
import { language, setLanguage, t } from './i18n'

const route = useRoute()
const sidebarOpen = ref(false)

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <Button
        class="menu-toggle"
        icon="pi pi-bars"
        text
        rounded
        aria-label="Toggle navigation"
        @click="sidebarOpen = !sidebarOpen"
      />
      <RouterLink class="brand" to="/home" @click="closeSidebar">
        <span class="brand-mark" aria-hidden="true">
          <img
            src="https://img.logo.dev/geomine.fr?format=png&size=96"
            alt=""
            @error="(event) => (event.target.style.display = 'none')"
          />
          <span class="brand-fallback">G</span>
        </span>
        <span class="brand-name">GeoMine</span>
        <span class="brand-divider"></span>
        <span class="brand-product">{{ t('brandProduct') }}</span>
      </RouterLink>
      <div class="topbar-right">
        <span class="live-indicator"><i></i>{{ t('liveSystem') }}</span>
        <div class="avatar" aria-label="Supervisor">SM</div>
      </div>
    </header>

    <div class="workspace">
      <button
        v-if="sidebarOpen"
        class="sidebar-scrim"
        aria-label="Close navigation"
        @click="closeSidebar"
      ></button>
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-label">{{ t('workspace') }}</div>
        <nav class="primary-nav" :aria-label="t('mainNavigation')">
          <RouterLink
            to="/home"
            class="nav-link"
            :class="{ 'nav-link-active': route.path === '/home' }"
            @click="closeSidebar"
          >
            <i class="pi pi-th-large"></i>
            <span>{{ t('home') }}</span>
          </RouterLink>
          <RouterLink
            to="/telemetry/items/new"
            class="nav-link"
            :class="{ 'nav-link-active': route.path === '/telemetry/items/new' }"
            @click="closeSidebar"
          >
            <i class="pi pi-chart-line"></i>
            <span>{{ t('newTelemetry') }}</span>
          </RouterLink>
        </nav>

        <div class="sidebar-bottom">
          <div class="language-label">{{ t('language') }}</div>
          <div class="language-switch" role="group" :aria-label="t('language')">
            <button :class="{ selected: language === 'en' }" @click="setLanguage('en')">EN</button>
            <button :class="{ selected: language === 'es' }" @click="setLanguage('es')">ES</button>
          </div>
          <div class="sidebar-footer">
            <span class="footer-mark">G</span>
            <span>GeoMine Solutions<br /><small>{{ t('operationsCenter') }}</small></span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
