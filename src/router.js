import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TelemetryFormView from './views/TelemetryFormView.vue'
import NotFoundView from './views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: HomeView },
    { path: '/telemetry/items/new', component: TelemetryFormView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

export default router
