import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ListPoisQuery, PoiResponseDto, PoiService } from './poi.service';

@Controller('v1/pois')
export class PoiController {
    private readonly logger = new Logger(PoiController.name);

    constructor(private readonly poiService: PoiService) { }

    @Get()
    async list(
        @Query('city') city?: string,
        @Query('category') category?: string,
        @Query('neLat') neLat?: string,
        @Query('neLng') neLng?: string,
        @Query('swLat') swLat?: string,
        @Query('swLng') swLng?: string,
        @Query('limit') limit?: string,
    ): Promise<PoiResponseDto[]> {
        const query: ListPoisQuery = {
            city,
            category,
            neLat: neLat ? Number(neLat) : undefined,
            neLng: neLng ? Number(neLng) : undefined,
            swLat: swLat ? Number(swLat) : undefined,
            swLng: swLng ? Number(swLng) : undefined,
            limit: limit ? Number(limit) : undefined,
        };

        try {
            return await this.poiService.list(query);
        } catch (err) {
            this.logger.error(`Failed to fetch POIs: ${err}`);
            return [];
        }
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<PoiResponseDto | null> {
        try {
            return await this.poiService.getById(id);
        } catch (err) {
            this.logger.error(`Failed to fetch POI ${id}: ${err}`);
            return null;
        }
    }
}
