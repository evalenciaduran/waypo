import { Injectable, Logger } from '@nestjs/common';
import { OverpassClient, OverpassElement } from './overpass.client';

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

@Injectable()
export class PoiService {
    private readonly logger = new Logger(PoiService.name);

    constructor(private readonly overpass: OverpassClient) { }

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

        const elements = await this.overpass.fetchPois(bbox, limit);

        let pois = elements.map((el) => this.mapElement(el, query.city));

        // Filter by category if requested
        if (query.category) {
            const cat = query.category.toLowerCase();
            pois = pois.filter((p) => p.category?.toLowerCase() === cat);
        }

        return pois.slice(0, limit);
    }

    async getById(id: string): Promise<PoiResponseDto | null> {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        const el = await this.overpass.fetchById(numericId);
        if (!el) return null;

        return this.mapElement(el);
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
            imageUrl: this.resolveImageUrl(tags),
            source: 'osm',
            updatedAt: new Date().toISOString(),
        };
    }

    /** Map OSM tags to our normalized category */
    private resolveCategory(tags: Record<string, string>): string {
        if (tags['tourism'] === 'museum') return 'museum';
        if (tags['tourism'] === 'viewpoint') return 'viewpoint';
        if (tags['tourism'] === 'artwork' || tags['tourism'] === 'gallery') return 'art';
        if (tags['tourism'] === 'attraction') return 'attraction';
        if (tags['tourism'] === 'hotel' || tags['tourism'] === 'hostel' || tags['tourism'] === 'guest_house') return 'accommodation';
        if (tags['tourism'] === 'information') return 'info';
        if (tags['historic']) return 'landmark';
        if (tags['amenity'] === 'restaurant') return 'restaurant';
        if (tags['amenity'] === 'cafe') return 'cafe';
        if (tags['amenity'] === 'bar' || tags['amenity'] === 'pub') return 'bar';
        if (tags['tourism']) return tags['tourism'];
        return 'general';
    }

    /** Build a short description from available OSM tags */
    private buildDescription(tags: Record<string, string>): string | null {
        const parts: string[] = [];

        if (tags['description'] || tags['description:es']) {
            return tags['description:es'] || tags['description'];
        }

        if (tags['tourism']) parts.push(this.capitalize(tags['tourism']));
        if (tags['historic']) parts.push(`Histórico: ${tags['historic']}`);
        if (tags['cuisine']) parts.push(`Cocina: ${tags['cuisine']}`);
        if (tags['opening_hours']) parts.push(`Horario: ${tags['opening_hours']}`);
        if (tags['wikipedia']) parts.push(`Wikipedia: ${tags['wikipedia']}`);

        return parts.length > 0 ? parts.join(' · ') : null;
    }

    /**
     * Resolve an actual image URL from OSM tags.
     *
     * OSM 'image' tag: usually a direct URL → use as-is
     * OSM 'wikimedia_commons' tag: can be:
     *   - "File:Example.jpg" → convert to Wikimedia thumbnail URL
     *   - "Category:Something" → not a direct image, skip
     *   - A direct URL → use as-is
     */
    private resolveImageUrl(tags: Record<string, string>): string | null {
        // 1. Direct URL in 'image' tag
        const imageTag = tags['image'];
        if (imageTag && imageTag.startsWith('http')) {
            return imageTag;
        }

        // 2. Wikimedia Commons tag
        const wmc = tags['wikimedia_commons'];
        if (wmc) {
            if (wmc.startsWith('http')) return wmc;

            // "File:Something.jpg" → Wikimedia thumbnail URL
            if (wmc.startsWith('File:')) {
                const filename = wmc.slice(5);
                return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`;
            }
            // "Category:..." → skip, not a direct image
        }

        return null;
    }

    private capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
    }
}
