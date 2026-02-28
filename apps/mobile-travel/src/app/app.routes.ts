import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'tourism-map',
    pathMatch: 'full',
  },
  {
    path: 'tourism-map',
    loadChildren: () => import('./features/tourism-map/routes').then((m) => m.TOURISM_MAP_ROUTES),
  },
];
