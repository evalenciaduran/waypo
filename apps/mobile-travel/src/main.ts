import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { TourismMapPageContainer } from './app/features/tourism-map/containers/tourism-map-page.container';

bootstrapApplication(TourismMapPageContainer, appConfig).catch((err) =>
  console.error(err)
);
