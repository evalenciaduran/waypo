import { Injectable, Logger } from '@nestjs/common';

/**
 * Client for the Wikidata API to batch-fetch images (P18 property).
 * Free, no API key required.
 *
 * Most OSM POIs have a `wikidata=Q...` tag. The P18 property contains
 * the main image filename, which we convert to a Wikimedia Commons thumbnail URL.
 */
@Injectable()
export class WikidataClient {
    private readonly logger = new Logger(WikidataClient.name);
    private readonly endpoint = 'https://www.wikidata.org/w/api.php';
    private readonly batchSize = 50; // Wikidata API limit per request

    /**
     * Batch-fetch image URLs for a list of Wikidata QIDs.
     * Returns a Map<QID, imageUrl>.
     */
    async fetchImages(qids: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();
        if (qids.length === 0) return result;

        // Process in batches of 50 (Wikidata limit)
        for (let i = 0; i < qids.length; i += this.batchSize) {
            const batch = qids.slice(i, i + this.batchSize);
            try {
                const batchResult = await this.fetchBatch(batch);
                for (const [qid, url] of batchResult) {
                    result.set(qid, url);
                }
            } catch (err) {
                this.logger.warn(`Wikidata batch fetch failed for ${batch.length} items: ${err}`);
            }
        }

        this.logger.debug(`Resolved ${result.size} images from ${qids.length} Wikidata IDs`);
        return result;
    }

    private async fetchBatch(qids: string[]): Promise<Map<string, string>> {
        const ids = qids.join('|');
        const url = `${this.endpoint}?action=wbgetentities&ids=${ids}&props=claims&format=json`;

        const res = await fetch(url, {
            headers: { 'User-Agent': 'WaypoTravelApp/1.0 (tourism BFF)' },
        });

        if (!res.ok) {
            throw new Error(`Wikidata API returned ${res.status}`);
        }

        const data = await res.json() as WikidataResponse;
        const result = new Map<string, string>();

        if (!data.entities) return result;

        for (const [qid, entity] of Object.entries(data.entities)) {
            const p18Claims = entity.claims?.P18;
            if (!p18Claims || p18Claims.length === 0) continue;

            const filename = p18Claims[0]?.mainsnak?.datavalue?.value;
            if (typeof filename === 'string' && filename.length > 0) {
                const imageUrl = this.filenameToUrl(filename);
                result.set(qid, imageUrl);
            }
        }

        return result;
    }

    /** Convert a Wikimedia Commons filename to a 400px thumbnail URL */
    private filenameToUrl(filename: string): string {
        const normalized = filename.replace(/ /g, '_');
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(normalized)}?width=400`;
    }
}

/* ---- Type definitions for Wikidata API response ---- */

interface WikidataResponse {
    entities?: Record<string, WikidataEntity>;
}

interface WikidataEntity {
    claims?: Record<string, WikidataClaim[]>;
}

interface WikidataClaim {
    mainsnak?: {
        datavalue?: {
            value?: string;
        };
    };
}
