# Backend + Performance + Offline Strategy

## Recommendation
Build a lightweight **BFF API** early (Node/Nest/Fastify) even for MVP.

## Why a backend is worth it
- Shields API keys and quotas.
- Centralizes normalization/mapping.
- Enables cache and prefetch by region.
- Avoids heavy mobile-side joins and duplicate queries.

## BFF endpoints (initial)
- `GET /v1/pois?bbox=&city=&category=&limit=`
- `GET /v1/pois/:id`
- `GET /v1/routes?origin=&destination=&mode=`

## Performance controls
- Redis cache for hot areas (`bbox + filters` keys).
- Stale-while-revalidate policy.
- ETag / If-None-Match support.
- Marker clustering and viewport-based queries.
- Pagination/limit by zoom level.

## Offline/poor network plan
- Local cache in device DB (SQLite/IndexedDB adapter).
- Keep last successful POI snapshot per city/viewport.
- Queue user actions needing network retry.
- Network-aware behavior via platform wrapper (`online`, `offline`, `slow`).
- Show explicit stale-data banner in UI.

## Route fallback
- Primary: Google Routes API.
- Fallback: last known route estimate when offline (if same origin/destination bucket).
