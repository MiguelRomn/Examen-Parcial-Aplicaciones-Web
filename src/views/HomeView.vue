<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InspectionCard from '../components/InspectionCard.vue'
import { loadInspectionData } from '../services/api'
import { t } from '../i18n'

const loading = ref(true)
const error = ref('')
const inspections = ref([])
const telemetry = ref([])
const sections = ref([])
const models = ref([])

const telemetryCount = computed(() => telemetry.value.length)
const totalAvailableCapacity = computed(() =>
  inspections.value.reduce((sum, inspection) => {
    const section = sections.value.find((item) => Number(item.id) === Number(inspection.pitSectionId))
    const maximum = Number(inspection.maxOperatingHours ?? section?.maxOperatingHours ?? 0)
    const readings = telemetry.value.filter(
      (reading) =>
        (reading.inspectionRecordId != null &&
          Number(reading.inspectionRecordId) === Number(inspection.id)) ||
        (reading.inspectionRecordId == null && reading.machineryCode === inspection.machineryCode),
    )
    const used = readings.reduce((total, reading) => total + (Number(reading.operatingHours) || 0), 0)
    return sum + maximum - used
  }, 0),
)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await loadInspectionData()
    inspections.value = data.inspections
    telemetry.value = data.telemetry
    sections.value = data.sections
    models.value = data.models
  } catch (cause) {
    console.error(cause)
    error.value = t('loadError')
  } finally {
    loading.value = false
  }
}

function getReadings(inspection) {
  return telemetry.value.filter(
    (reading) =>
      (reading.inspectionRecordId != null &&
        Number(reading.inspectionRecordId) === Number(inspection.id)) ||
      (reading.inspectionRecordId == null && reading.machineryCode === inspection.machineryCode),
  )
}

function getModel(inspection) {
  return models.value.find((model) => Number(model.id) === Number(inspection.modelId))
}

function getSection(inspection) {
  return sections.value.find((section) => Number(section.id) === Number(inspection.pitSectionId))
}

onMounted(loadData)
</script>

<template>
  <div class="page-view">
    <section class="welcome-banner">
      <div class="welcome-content">
        <div class="breadcrumb"><span>GeoMine</span><i class="pi pi-angle-right"></i>{{ t('home') }}</div>
        <p class="welcome-kicker">{{ t('homeIntro') }}</p>
        <h1>{{ t('homeTitle') }}</h1>
        <p class="welcome-copy">{{ t('inspectionCaption') }}</p>
      </div>
      <div class="banner-art" aria-hidden="true">
        <div class="sun-glow"></div>
        <div class="mountain mountain-back"></div>
        <div class="mountain mountain-front"></div>
        <div class="haul-truck">
          <div class="truck-bed"></div><div class="truck-cab"></div>
          <span class="truck-wheel wheel-one"></span><span class="truck-wheel wheel-two"></span>
        </div>
        <span class="banner-coordinate">12°02' S&nbsp;&nbsp; 77°01' W</span>
      </div>
    </section>

    <section class="overview-grid" :aria-label="t('inspections')">
      <div class="overview-tile">
        <div class="overview-icon icon-green"><i class="pi pi-check-circle"></i></div>
        <div><span>{{ t('activeInspections') }}</span><strong>{{ inspections.length }}</strong></div>
        <span class="overview-detail">{{ t('machineCount') }}</span>
      </div>
      <div class="overview-tile">
        <div class="overview-icon icon-blue"><i class="pi pi-chart-bar"></i></div>
        <div><span>{{ t('telemetryToday') }}</span><strong>{{ telemetryCount }}</strong></div>
        <span class="overview-detail">{{ t('readings') }}</span>
      </div>
      <div class="overview-tile overview-capacity">
        <div class="overview-icon icon-amber"><i class="pi pi-gauge"></i></div>
        <div><span>{{ t('fleetCapacity') }}</span><strong>{{ totalAvailableCapacity.toLocaleString() }} <small>h</small></strong></div>
        <span class="overview-detail">{{ t('availableCapacity') }}</span>
      </div>
    </section>

    <section class="inspections-section">
      <div class="section-heading">
        <div>
          <span class="section-overline">FLEET OVERVIEW</span>
          <h2>{{ t('inspections') }}</h2>
          <p>{{ t('inspectionCaption') }}</p>
        </div>
        <RouterLink class="text-link" to="/telemetry/items/new">
          <i class="pi pi-plus"></i>{{ t('newTelemetry') }}
        </RouterLink>
      </div>

      <div v-if="loading" class="state-panel">
        <i class="pi pi-spin pi-spinner"></i><span>{{ t('loading') }}</span>
      </div>
      <div v-else-if="error" class="state-panel error-panel">
        <i class="pi pi-exclamation-circle"></i><span>{{ error }}</span>
        <Button :label="t('retry')" severity="secondary" outlined @click="loadData" />
      </div>
      <div v-else-if="!inspections.length" class="state-panel">
        <i class="pi pi-inbox"></i><span>{{ t('noMachines') }}</span>
      </div>
      <div v-else class="inspection-grid">
        <InspectionCard
          v-for="inspection in inspections"
          :key="inspection.id"
          :inspection="inspection"
          :telemetry="getReadings(inspection)"
          :model="getModel(inspection)"
          :section="getSection(inspection)"
        />
      </div>
    </section>
    <footer class="page-footer">
      <span>© 2026 GeoMine Solutions</span><span><i class="pi pi-shield"></i> {{ t('liveSystem') }}</span>
    </footer>
  </div>
</template>
