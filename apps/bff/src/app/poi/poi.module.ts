import { Module } from '@nestjs/common';
import { OverpassClient } from './overpass.client';
import { WikidataClient } from './wikidata.client';
import { PoiService } from './poi.service';
import { PoiController } from './poi.controller';

@Module({
    controllers: [PoiController],
    providers: [OverpassClient, WikidataClient, PoiService],
})
export class PoiModule { }
