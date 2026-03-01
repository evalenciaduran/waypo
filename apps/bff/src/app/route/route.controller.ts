import { Controller, Get, Query } from '@nestjs/common';

export interface RouteSummaryDto {
    distanceMeters: number;
    durationSeconds: number;
    polyline: string;
}

/**
 * Placeholder route controller.
 * In a future phase this will proxy to Google Routes API or similar.
 * For now it returns a rough straight-line estimate.
 */
@Controller('v1/routes')
export class RouteController {
    @Get()
    getRoute(
        @Query('origin') origin: string,
        @Query('destination') destination: string,
        @Query('mode') mode: string,
    ): RouteSummaryDto {
        // Parse coordinates
        const [oLat, oLng] = (origin ?? '0,0').split(',').map(Number);
        const [dLat, dLng] = (destination ?? '0,0').split(',').map(Number);

        // Haversine straight-line distance
        const R = 6371000; // Earth radius in meters
        const dLat2 = ((dLat - oLat) * Math.PI) / 180;
        const dLng2 = ((dLng - oLng) * Math.PI) / 180;
        const a =
            Math.sin(dLat2 / 2) ** 2 +
            Math.cos((oLat * Math.PI) / 180) * Math.cos((dLat * Math.PI) / 180) * Math.sin(dLng2 / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const straightLine = R * c;

        // Apply detour factor based on mode
        const detourFactor = mode === 'walking' ? 1.3 : mode === 'transit' ? 1.4 : 1.2;
        const distanceMeters = Math.round(straightLine * detourFactor);

        // Rough speed estimates (m/s)
        const speeds: Record<string, number> = { walking: 1.4, transit: 8, driving: 14 };
        const speed = speeds[mode] ?? speeds['driving'];
        const durationSeconds = Math.round(distanceMeters / speed);

        return { distanceMeters, durationSeconds, polyline: '' };
    }
}
