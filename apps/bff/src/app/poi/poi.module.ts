import { Module } from '@nestjs/common';
import { OverpassClient } from './overpass.client';
import { PoiService } from './poi.service';
import { PoiController } from './poi.controller';

@Module({
    controllers: [PoiController],
    providers: [OverpassClient, PoiService],
})
export class PoiModule { }
