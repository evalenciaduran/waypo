import { Routes } from '@angular/router';
import { provideTourismMap } from './provide-tourism-map';

export const TOURISM_MAP_ROUTES: Routes = [
  {
    path: '',
    providers: [...provideTourismMap()],
    loadComponent: () =>
      import('./containers/tourism-map-page.container').then((m) => m.TourismMapPageContainer),
  },
];
