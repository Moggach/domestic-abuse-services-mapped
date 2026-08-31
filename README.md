# Domestic Abuse Services Mapped

A map-based directory of domestic abuse support services across the UK. Visitors can search or filter by location, service type, and specialism to find help near them; services can be submitted for review and added to the map.

🔗 **Live site:** [domesticabuseservices.uk](https://domesticabuseservices.uk/?page=1)

## Features

- **Interactive map** (Mapbox GL) with marker clustering. Services whose exact location is marked sensitive are shown at their local authority's centroid instead of a precise pin.
- **Search & filter** by service name, postcode (with a configurable radius and distance sorting), service type, local authority, and specialism.
- **"What's my local authority?"** postcode lookup to help visitors filter correctly.
- **Safety tools**: a "Safe exit" button, a first-visit safety modal, and a guide for clearing the site from browser history.
- **Public API** serving approved services as GeoJSON, documented with Swagger at `/api-docs`.
- **Service submissions** via an external Tally form; submissions are stored unapproved until manually reviewed.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) for the map and clustering
- [PostgreSQL](https://www.postgresql.org/) (via `pg`) for service data
- [Upstash Redis](https://upstash.com/) for API rate limiting
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) + [swagger-ui-react](https://github.com/swagger-api/swagger-ui-react) for API docs

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database with a `services` table (see [Database](#database) below)
- A [Mapbox](https://account.mapbox.com/) access token
- An [Upstash Redis](https://upstash.com/) database (for API rate limiting)

### Install

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root with:

| Variable                          | Description                                                             |
| --------------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`                    | PostgreSQL connection string                                            |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token, used client-side to render the map                 |
| `NEXT_PUBLIC_BASE_URL`            | Public base URL of the deployment, used to build the OpenAPI server URL |
| `UPSTASH_REDIS_REST_URL`          | Upstash Redis REST URL, used for API rate limiting                      |
| `UPSTASH_REDIS_REST_TOKEN`        | Upstash Redis REST token                                                |
| `ADMIN_API_TOKEN`                 | Bearer token required to create new services via `POST /api`            |

### Run locally

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Other scripts

| Command          | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `npm run build`  | Production build (output to `./dist`, see `next.config.mjs`) |
| `npm run start`  | Serve the production build                                   |
| `npm run lint`   | Lint and auto-fix with ESLint                                |
| `npm run format` | Format the codebase with Prettier                            |

## Database

The app reads from and writes to a single `services` table. Only rows with `approved = true` are served publicly. Columns expected by the app (see [`src/services/serviceData.ts`](src/services/serviceData.ts)):

| Column               | Type    | Notes                                                                                                     |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `name`               | text    |                                                                                                           |
| `description`        | text    |                                                                                                           |
| `address`            | text    |                                                                                                           |
| `postcode`           | text    |                                                                                                           |
| `email`              | text    |                                                                                                           |
| `website`            | text    |                                                                                                           |
| `phone`              | text    |                                                                                                           |
| `donate`             | text    | Optional donation link                                                                                    |
| `service_type`       | text[]  | e.g. `Domestic abuse support`, `Legal advice`                                                             |
| `service_specialism` | text[]  | e.g. groups the service specialises in supporting                                                         |
| `local_authority`    | text    | Must match the `LAD24NM` values used in `public/data/local-authority-*.geojson` for map filtering to work |
| `lng`, `lat`         | numeric | Coordinates of the service                                                                                |
| `location_level`     | text    | Set to `borough_only` to hide the precise pin and show the local authority centroid instead               |
| `approved`           | boolean | Only approved services are shown                                                                          |

New submissions from `POST /api` are inserted with `approved = false` and must be approved directly in the database before they appear on the map.

## API

The public API is documented interactively at `/api-docs` (Swagger UI), backed by the OpenAPI spec at `/api/swagger`.

- `GET /api` — returns approved services as a GeoJSON `FeatureCollection`. Accepts optional `postcode` and `radius` (miles, default 10) query params to filter and sort by distance.
- `POST /api` — creates a new (unapproved) service. Requires an `Authorization: Bearer <ADMIN_API_TOKEN>` header and is rate-limited to 5 requests per 10 seconds per IP.

## Project structure

```
src/
├── app/
│   ├── [[...slug]]/     # Catch-all route rendering the main map page
│   ├── api/              # GeoJSON API + OpenAPI spec routes
│   ├── components/       # UI components
│   ├── constants/        # Static config (e.g. service type → icon mapping)
│   ├── contexts/         # SearchContext (search/map state)
│   ├── hooks/            # useSearchFilters, useMapData, useURLParams
│   ├── lib/               # Pure helpers: geo math, postcodes.io calls, data filters
│   ├── about/, privacy/, clear-browser/, api-docs/   # Static pages
│   └── types.ts           # Shared domain types (Feature, Properties, etc.)
└── services/
    └── serviceData.ts     # Database access (read/create services)
```

## Contributing a service

Services aren't submitted through the app directly — use the ["Submit here"](https://tally.so/r/vG9ADg) link in the site footer. Submissions are reviewed and approved manually before they appear on the map.

## License

[MIT](LICENSE)
