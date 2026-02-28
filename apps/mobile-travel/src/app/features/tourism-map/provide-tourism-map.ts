import { Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TourismMapStore } from './state/tourism-map.store';
import { TOURISM_POI_REPO } from './data-access/ports/tourism-poi.repo';
import { TourismPoiHttpAdapter } from './data-access/adapters/tourism-poi-http.adapter';
import { TourismPoiMockAdapter } from './data-access/adapters/tourism-poi-mock.adapter';

export function provideTourismMap(): Provider[] {
  return [
    TourismMapStore,
    {
      provide: TOURISM_POI_REPO,
      useClass: environment.useMocks ? TourismPoiMockAdapter : TourismPoiHttpAdapter,
    },
  ];
}
