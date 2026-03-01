import { Injectable, Logger } from '@nestjs/common';
import { OverpassClient, OverpassElement } from './overpass.client';
import { WikidataClient } from './wikidata.client';

/** Matches the TourismPoiDto expected by the mobile frontend */
export interface PoiResponseDto {
    id: string;
    name: string | null;
    city: string | null;
    category: string | null;
    lat: number;
    lng: number;
    shortDescription: string | null;
    imageUrl: string | null;
    source: 'osm';
    updatedAt: string;
}

export interface ListPoisQuery {
    city?: string;
    category?: string;
    neLat?: number;
    neLng?: number;
    swLat?: number;
    swLng?: number;
    limit?: number;
}

/** Well-known bounding boxes for major Spanish cities */
const CITY_BBOX: Record<string, { south: number; west: number; north: number; east: number }> = {
    madrid: { south: 40.35, west: -3.80, north: 40.50, east: -3.58 },
    barcelona: { south: 41.33, west: 2.07, north: 41.47, east: 2.23 },
    valencia: { south: 39.42, west: -0.42, north: 39.51, east: -0.32 },
    sevilla: { south: 37.34, west: -6.02, north: 37.42, east: -5.92 },
    malaga: { south: 36.68, west: -4.48, north: 36.75, east: -4.38 },
    bilbao: { south: 43.22, west: -2.98, north: 43.29, east: -2.88 },
    granada: { south: 37.14, west: -3.64, north: 37.21, east: -3.55 },
    zaragoza: { south: 41.60, west: -0.95, north: 41.70, east: -0.82 },
    spain: { south: 36.0, west: -9.5, north: 43.8, east: 4.4 },
};

/** Cache entry with TTL */
interface CacheEntry {
    data: PoiResponseDto[];
    expiresAt: number;
}

/** Cache TTL: 1 hour */
const CACHE_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class PoiService {
    private readonly logger = new Logger(PoiService.name);
    private readonly cache = new Map<string, CacheEntry>();

    constructor(
        private readonly overpass: OverpassClient,
        private readonly wikidata: WikidataClient,
    ) { }

    async list(query: ListPoisQuery): Promise<PoiResponseDto[]> {
        const limit = Math.min(query.limit ?? 50, 200);

        // Determine bounding box: explicit coords > city name > default (Madrid)
        let bbox: { south: number; west: number; north: number; east: number };

        if (query.neLat != null && query.neLng != null && query.swLat != null && query.swLng != null) {
            bbox = {
                south: Number(query.swLat),
                west: Number(query.swLng),
                north: Number(query.neLat),
                east: Number(query.neLng),
            };
        } else if (query.city) {
            const key = query.city.toLowerCase();
            bbox = CITY_BBOX[key] ?? CITY_BBOX['madrid'];
        } else {
            bbox = CITY_BBOX['madrid'];
        }

        // Round bbox to 2 decimal places for cache key stability
        const cacheKey = this.buildCacheKey(bbox);

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            this.logger.debug(`Cache HIT for ${cacheKey} (${cached.data.length} POIs)`);
            let pois = cached.data;
            if (query.category) {
                const cat = query.category.toLowerCase();
                pois = pois.filter((p) => p.category?.toLowerCase() === cat);
            }
            return pois.slice(0, limit);
        }

        // Cache MISS — fetch from Overpass
        this.logger.debug(`Cache MISS for ${cacheKey}, fetching from Overpass...`);
        const elements = await this.overpass.fetchPois(bbox, limit);

        // Map Overpass elements to DTOs (without images yet)
        let pois = elements.map((el) => this.mapElement(el, query.city));

        // Enrich with Wikidata images
        pois = await this.enrichWithImages(pois, elements);

        // Store in cache (full unfiltered result)
        this.cache.set(cacheKey, {
            data: pois,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });
        this.logger.debug(`Cached ${pois.length} POIs for ${cacheKey}`);

        // Evict old cache entries periodically
        this.evictExpiredEntries();

        // Filter by category if requested
        if (query.category) {
            const cat = query.category.toLowerCase();
            pois = pois.filter((p) => p.category?.toLowerCase() === cat);
        }

        return pois.slice(0, limit);
    }

    async getById(id: string): Promise<PoiResponseDto | null> {
        // Check if the POI is in any cache entry first
        for (const entry of this.cache.values()) {
            if (entry.expiresAt < Date.now()) continue;
            const found = entry.data.find((p) => p.id === id);
            if (found) return found;
        }

        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        const el = await this.overpass.fetchById(numericId);
        if (!el) return null;

        const poi = this.mapElement(el);

        // Try to enrich single POI with image
        const enriched = await this.enrichWithImages([poi], [el]);
        return enriched[0] ?? poi;
    }

    /**
     * Enrich POIs with images from Wikidata P18 property.
     * Extracts wikidata QIDs from Overpass elements, batch-fetches images,
     * and assigns them to the corresponding POI DTOs.
     */
    private async enrichWithImages(
        pois: PoiResponseDto[],
        elements: OverpassElement[],
    ): Promise<PoiResponseDto[]> {
        // Build a map of POI id → wikidata QID
        const qidMap = new Map<string, string>();
        for (const el of elements) {
            const qid = el.tags?.['wikidata'];
            if (qid && qid.startsWith('Q')) {
                qidMap.set(String(el.id), qid);
            }
        }

        if (qidMap.size === 0) {
            this.logger.debug('No Wikidata IDs found, skipping enrichment');
            return pois;
        }

        // Batch fetch images from Wikidata
        const uniqueQids = [...new Set(qidMap.values())];
        this.logger.debug(`Enriching ${uniqueQids.length} POIs with Wikidata images...`);

        let imageMap: Map<string, string>;
        try {
            imageMap = await this.wikidata.fetchImages(uniqueQids);
        } catch (err) {
            this.logger.warn(`Wikidata enrichment failed: ${err}`);
            return pois;
        }

        // Assign images to POIs
        let enrichedCount = 0;
        for (const poi of pois) {
            // If POI already has an image from OSM tags, keep it
            if (poi.imageUrl) continue;

            const qid = qidMap.get(poi.id);
            if (qid && imageMap.has(qid)) {
                poi.imageUrl = imageMap.get(qid)!;
                enrichedCount++;
            }
        }

        this.logger.debug(`Enriched ${enrichedCount} POIs with Wikidata images`);
        return pois;
    }

    /** Map an Overpass element to our normalized DTO */
    private mapElement(el: OverpassElement, cityHint?: string): PoiResponseDto {
        const tags = el.tags ?? {};
        const lat = el.lat ?? el.center?.lat ?? 0;
        const lng = el.lon ?? el.center?.lon ?? 0;

        return {
            id: String(el.id),
            name: tags['name'] || tags['name:es'] || tags['name:en'] || null,
            city: tags['addr:city'] || cityHint || null,
            category: this.resolveCategory(tags),
            lat,
            lng,
            shortDescription: this.buildDescription(tags),
            imageUrl: this.resolveDirectImageUrl(tags),
            source: 'osm',
            updatedAt: new Date().toISOString(),
        };
    }

    /**
     * Resolve a direct image URL from OSM tags (before Wikidata enrichment).
     * Only uses tags that are actual image URLs or File: references.
     */
    private resolveDirectImageUrl(tags: Record<string, string>): string | null {
        const imageTag = tags['image'];
        if (imageTag && imageTag.startsWith('http')) return imageTag;

        const wmc = tags['wikimedia_commons'];
        if (wmc) {
            if (wmc.startsWith('http')) return wmc;
            if (wmc.startsWith('File:')) {
                const filename = wmc.slice(5);
                return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`;
            }
        }

        return null;
    }

    /** Map OSM tags to our normalized category */
    private resolveCategory(tags: Record<string, string>): string {
        if (tags['tourism'] === 'museum') return 'museum';
        if (tags['tourism'] === 'viewpoint') return 'viewpoint';
        if (tags['tourism'] === 'artwork' || tags['tourism'] === 'gallery') return 'art';
        if (tags['tourism'] === 'attraction') return 'attraction';
        if (tags['historic']) return 'landmark';
        if (tags['tourism']) return tags['tourism'];
        return 'general';
    }

    /** Build a short description from available OSM tags */
    private buildDescription(tags: Record<string, string>): string | null {
        if (tags['description'] || tags['description:es']) {
            return tags['description:es'] || tags['description'];
        }

        const parts: string[] = [];
        if (tags['tourism']) parts.push(this.capitalize(tags['tourism']));
        if (tags['historic']) parts.push(`Histórico: ${tags['historic']}`);
        if (tags['opening_hours']) parts.push(`Horario: ${tags['opening_hours']}`);
        if (tags['wikipedia']) parts.push(`Wikipedia: ${tags['wikipedia']}`);

        return parts.length > 0 ? parts.join(' · ') : null;
    }

    /** Build a stable cache key from a bounding box (rounded to 2 decimals) */
    private buildCacheKey(bbox: { south: number; west: number; north: number; east: number }): string {
        const r = (n: number) => Math.round(n * 100) / 100;
        return `${r(bbox.south)},${r(bbox.west)},${r(bbox.north)},${r(bbox.east)}`;
    }

    /** Remove expired entries from the cache */
    private evictExpiredEntries(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt < now) {
                this.cache.delete(key);
            }
        }
    }

    private capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
    }
}
