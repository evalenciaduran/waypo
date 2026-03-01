import { Injectable, Logger } from '@nestjs/common';

/** Raw element returned by the Overpass API */
export interface OverpassElement {
    type: 'node' | 'way' | 'relation';
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
}

interface OverpassResponse {
    elements: OverpassElement[];
}

export interface OverpassBbox {
    south: number;
    west: number;
    north: number;
    east: number;
}

@Injectable()
export class OverpassClient {
    private readonly logger = new Logger(OverpassClient.name);
    private readonly endpoint = 'https://overpass-api.de/api/interpreter';
    private readonly maxRetries = 2;

    /**
     * Fetch tourism POIs within a bounding box from the Overpass API.
     *
     * The query looks for nodes and ways tagged with:
     * - tourism=* (museums, viewpoints, attractions, hotels…)
     * - historic=* (castles, monuments, ruins…)
     * - amenity in [restaurant, cafe, bar, pub]
     */
    async fetchPois(bbox: OverpassBbox, limit = 200): Promise<OverpassElement[]> {
        const { south, west, north, east } = bbox;
        const bboxStr = `${south},${west},${north},${east}`;

        const query = `
[out:json][timeout:25];
(
  node["tourism"](${bboxStr});
  way["tourism"](${bboxStr});
  node["historic"](${bboxStr});
  way["historic"](${bboxStr});
  node["amenity"~"restaurant|cafe|bar|pub"](${bboxStr});
);
out body center ${limit};
`;

        this.logger.debug(`Overpass query for bbox [${bboxStr}], limit=${limit}`);
        return this.executeWithRetry(query);
    }

    /** Fetch a single element by its OSM id */
    async fetchById(osmId: number): Promise<OverpassElement | null> {
        const query = `
[out:json][timeout:10];
(
  node(${osmId});
  way(${osmId});
);
out body center 1;
`;

        try {
            const elements = await this.executeWithRetry(query);
            return elements[0] ?? null;
        } catch {
            return null;
        }
    }

    /** Execute an Overpass query with automatic retry on transient errors (429, 504) */
    private async executeWithRetry(query: string): Promise<OverpassElement[]> {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const res = await fetch(this.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `data=${encodeURIComponent(query)}`,
                });

                if (res.status === 429 || res.status === 504) {
                    const waitMs = (attempt + 1) * 2000;
                    this.logger.warn(`Overpass ${res.status}, retrying in ${waitMs}ms (attempt ${attempt + 1}/${this.maxRetries + 1})`);
                    await this.sleep(waitMs);
                    continue;
                }

                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    this.logger.error(`Overpass API error ${res.status}: ${text.slice(0, 200)}`);
                    throw new Error(`Overpass API returned ${res.status}`);
                }

                const data = (await res.json()) as OverpassResponse;
                this.logger.debug(`Overpass returned ${data.elements.length} elements`);
                return data.elements;
            } catch (err) {
                if (attempt === this.maxRetries) throw err;
                const waitMs = (attempt + 1) * 2000;
                this.logger.warn(`Overpass fetch failed, retrying in ${waitMs}ms: ${err}`);
                await this.sleep(waitMs);
            }
        }
        return [];
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
