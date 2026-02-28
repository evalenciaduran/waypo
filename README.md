# Tourism Platform (Ionic + Angular + Nx) - Starter Blueprint

Base scaffold to start a mobile-first tourism platform for Spain with:

- Ionic + Angular (standalone-first)
- Nx monorepo architecture (`apps/` + `libs/`)
- Google Maps for map visualization and routing (A -> B)
- POI ingestion from external data sources
- Performance and offline-first mindset

## Goals

- Show POIs by city/area on map.
- Show summary list + detail view.
- Build routes between origin and destination and estimate travel time.
- Keep UX usable with unstable/slow networks.

## Proposed Monorepo Layout

```text
apps/
  mobile-travel/
libs/
  core/platform/
  integrations/poi/
  domain/tourism/
docs/architecture/
e2e/
tools/
```

## First steps

1. Create Nx workspace and Ionic app shell.
2. Wire Google Maps key + backend base URL.
3. Implement BFF for POI query, normalization, caching and route proxy.
4. Add Playwright baseline flows with `data-testid` selectors.

See detailed decisions in `docs/architecture/*`.
