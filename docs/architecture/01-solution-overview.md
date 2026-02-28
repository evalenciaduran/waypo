# Solution Overview

## Scope
Ionic + Angular application to discover Spanish tourism POIs, inspect details, and calculate route/time from A to B.

## Architecture (high level)
- `apps/mobile-travel`: Ionic Angular app (presentation, routing, feature stores).
- `libs/domain/tourism`: domain contracts and business rules.
- `libs/integrations/poi`: adapters and clients for POI sources.
- `libs/core/platform/*`: wrappers for platform and plugin APIs (network, geolocation, maps).
- `backend/bff` (recommended next): normalization, caching, source orchestration, rate-limit shielding.

## Core user flows
1. Open app and load Spain map viewport.
2. Query POIs for current city/viewport.
3. Tap POI marker/list item for detail.
4. Set origin + destination and calculate route + ETA.

## Non-functional targets
- Fast first paint with map shell.
- Deterministic behavior with flaky network.
- Route-scoped feature providers.
- Stable E2E selectors with `data-testid`.
