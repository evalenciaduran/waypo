# POI Data Sources for Spain

## Recommended strategy
Use a **hybrid approach**:
1. **Primary source**: OpenStreetMap (Overpass API or self-hosted extracts) for broad POI coverage.
2. **Enrichment source**: Wikipedia/Wikidata metadata for richer descriptions/images when available.
3. **Optional fallback/commercial**: OpenTripMap or Google Places for edge cases/quality gaps.

## Why hybrid
- OSM gives broad coverage and low lock-in.
- Enrichment improves detail view quality.
- Commercial fallback protects quality for high-priority cities.

## Important note
Do not call third-party POI APIs directly from mobile app at scale. Use backend BFF to:
- normalize fields
- deduplicate
- cache by city/viewport
- apply throttling and retries

## Candidate providers
- OSM Overpass: open data, rich POI tags, requires query/caching discipline.
- OpenTripMap: tourism-focused POI endpoint, useful bootstrap option.
- GeoNames: broad geo reference data (not enough alone for rich tourism cards).
- Spain open data portals: useful for curated local datasets.

## Contract to keep in domain
Normalized POI shape:
- `id`, `name`, `location(lat,lng)`
- `category`, `city`, `rating?`, `tags[]`
- `shortDescription`, `imageUrl?`
- `source`, `updatedAt`
