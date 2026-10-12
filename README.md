# GeoMine Machinery & Telemetry Management

A Vue 3 dashboard for reviewing mining machinery inspections and recording telemetry.

## Requirements

- Node.js 20.19+ or 22.12+
- json-server 0.17.4

## Run locally

Install dependencies and start the frontend:

```sh
npm install
npm run dev
```

In a separate terminal, start the fake API:

```sh
cd server
json-server --watch db.json
```

The frontend uses `http://localhost:3000` by default. Set `VITE_API_BASE_URL` in a
`.env.local` file to use a different API base URL.

## Routes

- `/` redirects to `/home`.
- `/home` shows the inspection and telemetry dashboard.
- `/telemetry/items/new` opens the telemetry entry form.
- Unsupported routes show a not-found page with a link back to Home.

The dashboard retrieves inspections and telemetry from json-server and joins them
with the pit-section and machinery-model catalogs hosted by GeoMine's external
catalog endpoints. The interface defaults to English and can be switched to Spanish
from the sidebar.
