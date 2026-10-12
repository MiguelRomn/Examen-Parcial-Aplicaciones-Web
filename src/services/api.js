const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const catalogUrls = {
  sections:
    'https://gist.githubusercontent.com/ovillafuerte/aee81192da8fe9df3a11e4b27f07e8f7/raw/4d96caf25d747d1463d9c997e03330b52e6005d4/pit-sections',
  models:
    'https://gist.githubusercontent.com/ovillafuerte/bb42d462214465c70b3472a10e23c558/raw/06083af1287c749e219bb650e05700274d020c09/machinery-models.json',
}

async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`)
  }
  return response.json()
}

export async function loadInspectionData() {
  const [inspections, telemetry, sections, models] = await Promise.all([
    getJson(`${API_BASE_URL}/inspection-records`),
    getJson(`${API_BASE_URL}/telemetry-readings`),
    getJson(catalogUrls.sections),
    getJson(catalogUrls.models),
  ])

  return { inspections, telemetry, sections, models }
}

export async function createTelemetry(payload) {
  const response = await fetch(`${API_BASE_URL}/telemetry-readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Telemetry creation failed (${response.status})`)
  }
  return response.json()
}
