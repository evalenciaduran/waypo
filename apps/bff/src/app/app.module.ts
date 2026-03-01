import { Module } from '@nestjs/common';
import { PoiModule } from './poi/poi.module';
import { RouteModule } from './route/route.module';

@Module({
  imports: [PoiModule, RouteModule],
})
export class AppModule { }
