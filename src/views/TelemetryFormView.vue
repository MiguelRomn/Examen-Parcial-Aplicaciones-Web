<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { createTelemetry, loadInspectionData } from '../services/api'
import { t } from '../i18n'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const catalogError = ref('')
const sections = ref([])
const models = ref([])
const inspections = ref([])
const telemetry = ref([])
const sectionId = ref(null)
const inspectionId = ref(null)
const operatingHours = ref(null)
const engineTemperatureC = ref(null)
const oilPressurePsi = ref(null)
const alertTriggered = ref(false)
const attemptedSubmit = ref(false)

const sectionMachines = computed(() => {
  if (sectionId.value == null) return []
  return inspections.value
    .filter((inspection) => Number(inspection.pitSectionId) === Number(sectionId.value))
    .map((inspection) => ({
      ...inspection,
      model: models.value.find((model) => Number(model.id) === Number(inspection.modelId)),
    }))
    .filter((inspection) => !inspection.model || Number(inspection.model.idSection) === Number(sectionId.value))
})
const selectedInspection = computed(
  () => sectionMachines.value.find((inspection) => Number(inspection.id) === Number(inspectionId.value)) || null,
)
const selectedSection = computed(
  () => sections.value.find((section) => Number(section.id) === Number(sectionId.value)) || null,
)
const inspectionReadings = computed(() => {
  if (!selectedInspection.value) return []
  return telemetry.value.filter(
    (reading) =>
      (reading.inspectionRecordId != null &&
        Number(reading.inspectionRecordId) === Number(selectedInspection.value.id)) ||
      (reading.inspectionRecordId == null &&
        reading.machineryCode === selectedInspection.value.machineryCode),
  )
})
const capacityAvailable = computed(() => {
  if (!selectedInspection.value) return 0
  const inspectionMaximum = Number(selectedInspection.value.maxOperatingHours)
  const sectionMaximum = Number(selectedSection.value?.maxOperatingHours)
  const maximum =
    Number.isFinite(inspectionMaximum) && inspectionMaximum > 0
      ? inspectionMaximum
      : Number.isFinite(sectionMaximum)
        ? sectionMaximum
        : 0
  const used = inspectionReadings.value.reduce((total, reading) => {
    const hours = Number(reading.operatingHours)
    return total + (Number.isFinite(hours) ? hours : 0)
  }, 0)
  return maximum - used
})
const validHours = computed(
  () =>
    Number.isFinite(Number(operatingHours.value)) &&
    Number(operatingHours.value) > 0 &&
    Number(operatingHours.value) <= capacityAvailable.value,
)

watch(sectionId, () => {
  inspectionId.value = null
  error.value = ''
})
watch(inspectionId, () => {
  error.value = ''
})

async function loadData() {
  try {
    const data = await loadInspectionData()
    sections.value = data.sections
    models.value = data.models
    inspections.value = data.inspections
    telemetry.value = data.telemetry
  } catch (cause) {
    console.error(cause)
    catalogError.value = t('loadError')
  } finally {
    loading.value = false
  }
}

async function submitTelemetry() {
  attemptedSubmit.value = true
  error.value = ''
  if (
    !selectedInspection.value ||
    !validHours.value ||
    !Number.isFinite(Number(engineTemperatureC.value)) ||
    !Number.isFinite(Number(oilPressurePsi.value))
  ) {
    if (Number(operatingHours.value) > capacityAvailable.value) error.value = t('capacityExceeded')
    return
  }

  saving.value = true
  try {
    await createTelemetry({
      inspectionRecordId: selectedInspection.value.id,
      machineryCode: selectedInspection.value.machineryCode,
      modelId: selectedInspection.value.modelId,
      pitSectionId: selectedInspection.value.pitSectionId,
      operatingHours: Number(operatingHours.value),
      engineTemperatureC: Number(engineTemperatureC.value),
      oilPressurePsi: Number(oilPressurePsi.value),
      alertTriggered: alertTriggered.value,
      registeredAt: new Date().toISOString(),
    })
    await router.push('/home')
  } catch (cause) {
    console.error(cause)
    error.value = t('saveError')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="page-view form-page">
    <div class="breadcrumb form-breadcrumb">
      <RouterLink to="/home">GeoMine</RouterLink><i class="pi pi-angle-right"></i>{{ t('newTelemetry') }}
    </div>
    <header class="form-page-heading">
      <div class="form-heading-icon"><i class="pi pi-chart-line"></i></div>
      <div>
        <span class="section-overline">{{ t('inspections') }}</span>
        <h1>{{ t('newTitle') }}</h1>
        <p class="form-subtitle">{{ t('newSubtitle') }}</p>
      </div>
    </header>

    <div v-if="loading" class="state-panel form-state">
      <i class="pi pi-spin pi-spinner"></i><span>{{ t('loadingCatalog') }}</span>
    </div>
    <div v-else-if="catalogError" class="state-panel error-panel form-state">
      <i class="pi pi-exclamation-circle"></i><span>{{ catalogError }}</span>
      <Button :label="t('cancel')" severity="secondary" outlined @click="router.push('/home')" />
    </div>
    <form v-else class="telemetry-form" @submit.prevent="submitTelemetry">
      <div class="form-intro">
        <div class="form-intro-icon"><i class="pi pi-sliders-h"></i></div>
        <div><strong>{{ t('newSubtitle') }}</strong><span>{{ t('formDescription') }}</span></div>
        <span class="required-note"><b>*</b> {{ t('required') }}</span>
      </div>

      <div class="form-fields">
        <label class="field">
          <span>{{ t('sectionLabel') }} <b>*</b></span>
          <select v-model="sectionId" required>
            <option :value="null" disabled>{{ t('sectionPlaceholder') }}</option>
            <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.name }}</option>
          </select>
          <small v-if="attemptedSubmit && sectionId == null" class="field-error">{{ t('required') }}</small>
        </label>

        <label class="field">
          <span>{{ t('machineLabel') }} <b>*</b></span>
          <select v-model="inspectionId" :disabled="sectionId == null" required>
            <option :value="null" disabled>{{ sectionId == null ? t('selectSectionFirst') : t('machinePlaceholder') }}</option>
            <option v-for="machine in sectionMachines" :key="machine.id" :value="machine.id">
              {{ machine.model?.modelName || t('machinery') }} · {{ machine.machineryCode }}
            </option>
          </select>
          <small v-if="sectionId != null && !sectionMachines.length" class="field-hint">{{ t('noMachines') }}</small>
          <small v-else-if="attemptedSubmit && !selectedInspection" class="field-error">{{ t('required') }}</small>
        </label>

        <div v-if="selectedInspection" class="capacity-banner">
          <span class="capacity-banner-icon"><i class="pi pi-gauge"></i></span>
          <span><small>{{ t('capacityRemaining') }}</small><strong>{{ capacityAvailable.toLocaleString() }} h</strong></span>
          <span class="capacity-banner-machine">{{ selectedInspection.machineryCode }}</span>
        </div>

        <div class="form-divider"><span>TELEMETRY DATA</span></div>

        <label class="field">
          <span>{{ t('hoursLabel') }} <b>*</b></span>
          <div class="input-with-unit">
            <input v-model.number="operatingHours" type="number" min="0.01" step="0.01" :max="capacityAvailable" required :placeholder="`0.00`" />
            <span>h</span>
          </div>
          <small class="field-hint">{{ t('capacityHelp') }}</small>
          <small v-if="attemptedSubmit && operatingHours != null && !validHours" class="field-error">
            {{ Number(operatingHours) > capacityAvailable ? t('capacityExceeded') : t('positiveNumber') }}
          </small>
        </label>

        <div class="form-row">
          <label class="field">
            <span>{{ t('temperatureLabel') }} <b>*</b></span>
            <div class="input-with-unit">
              <input v-model.number="engineTemperatureC" type="number" step="0.1" required placeholder="0.0" />
              <span>°C</span>
            </div>
            <small v-if="attemptedSubmit && !Number.isFinite(Number(engineTemperatureC))" class="field-error">{{ t('required') }}</small>
          </label>
          <label class="field">
            <span>{{ t('pressureLabel') }} <b>*</b></span>
            <div class="input-with-unit">
              <input v-model.number="oilPressurePsi" type="number" min="0" step="0.1" required placeholder="0.0" />
              <span>psi</span>
            </div>
            <small v-if="attemptedSubmit && !Number.isFinite(Number(oilPressurePsi))" class="field-error">{{ t('required') }}</small>
          </label>
        </div>

        <label class="alert-toggle">
          <input v-model="alertTriggered" type="checkbox" />
          <span class="toggle-indicator"><i class="pi pi-exclamation"></i></span>
          <span>{{ t('alertLabel') }}</span>
        </label>
        <div v-if="error" class="form-error"><i class="pi pi-exclamation-circle"></i>{{ error }}</div>
      </div>

      <footer class="form-actions">
        <Button :label="t('cancel')" severity="secondary" text type="button" @click="router.push('/home')" />
        <Button :label="t('create')" icon="pi pi-check" type="submit" :loading="saving" />
      </footer>
    </form>
  </div>
</template>
