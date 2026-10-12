<script setup>
import { computed } from 'vue'
import { t } from '../i18n'

const props = defineProps({
  inspection: { type: Object, required: true },
  telemetry: { type: Array, required: true },
  model: { type: Object, default: null },
  section: { type: Object, default: null },
})

const operatingHours = computed(() =>
  props.telemetry.reduce((total, reading) => {
    const value = Number(reading.operatingHours)
    return total + (Number.isFinite(value) ? value : 0)
  }, 0),
)
const maximumHours = computed(() => {
  const inspectionMaximum = Number(props.inspection.maxOperatingHours)
  if (Number.isFinite(inspectionMaximum) && inspectionMaximum > 0) return inspectionMaximum
  const sectionMaximum = Number(props.section?.maxOperatingHours)
  return Number.isFinite(sectionMaximum) ? sectionMaximum : 0
})
const availableCapacity = computed(() => maximumHours.value - operatingHours.value)
const statusKey = computed(() => {
  if (props.inspection.status === 'OPERATIONAL') return 'statusOperational'
  if (props.inspection.status === 'INACTIVE') return 'statusInactive'
  return 'statusMaintenance'
})
const statusClass = computed(() => {
  if (props.inspection.status === 'OPERATIONAL') return 'status-good'
  if (props.inspection.status === 'INACTIVE') return 'status-muted'
  return 'status-warning'
})
</script>

<template>
  <article class="inspection-card">
    <div class="inspection-card-head">
      <div class="machine-icon"><i class="pi pi-truck"></i></div>
      <div class="machine-details">
        <span class="eyebrow">{{ t('machinery') }}</span>
        <h3>{{ model?.modelName || t('machinery') }}</h3>
        <span class="machine-code">{{ inspection.machineryCode }}</span>
      </div>
      <span class="status-pill" :class="statusClass">
        <i></i>{{ t(statusKey) }}
      </span>
    </div>

    <div class="inspection-meta">
      <span><i class="pi pi-map-marker"></i>{{ section?.name || t('sectionUnknown') }}</span>
      <span v-if="inspection.inspectedAt">
        <i class="pi pi-calendar"></i>{{ t('lastInspection') }} · {{ inspection.inspectedAt }}
      </span>
    </div>

    <div v-if="telemetry.length" class="telemetry-list">
      <div v-for="(reading, index) in telemetry" :key="reading.id ?? index" class="reading-row">
        <div class="reading-title">
          <span class="reading-dot" :class="{ 'reading-alert': reading.alertTriggered }"></span>
          <span>{{ t('readings') }} {{ String(index + 1).padStart(2, '0') }}</span>
          <span class="reading-time">{{ reading.registeredAt ? new Date(reading.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }}</span>
        </div>
        <div class="reading-values">
          <div class="reading-metric">
            <span class="metric-label"><i class="pi pi-clock"></i>{{ t('operatingHours') }}</span>
            <strong>{{ Number.isFinite(Number(reading.operatingHours)) ? `${Number(reading.operatingHours).toLocaleString()} h` : '—' }}</strong>
          </div>
          <div class="reading-metric">
            <span class="metric-label"><i class="pi pi-sun"></i>{{ t('engineTemperature') }}</span>
            <strong :class="{ 'temperature-high': reading.alertTriggered }">
              {{ Number.isFinite(Number(reading.engineTemperatureC)) ? `${Number(reading.engineTemperatureC).toFixed(1)}°C` : '—' }}
            </strong>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-telemetry">
      <span class="empty-icon"><i class="pi pi-wave-pulse"></i></span>
      <strong>{{ t('noTelemetry') }}</strong>
      <span>{{ t('noTelemetryDescription') }}</span>
    </div>

    <footer class="inspection-card-foot">
      <div class="capacity-stat">
        <span>{{ t('totalTelemetry') }}</span>
        <strong>{{ operatingHours.toLocaleString() }} <small>h</small></strong>
      </div>
      <div class="capacity-stat capacity-available">
        <span>{{ t('availableCapacity') }}</span>
        <strong>{{ availableCapacity.toLocaleString() }} <small>h</small></strong>
      </div>
    </footer>
  </article>
</template>
