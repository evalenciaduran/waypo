import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteInput, RouteSummary, TourismPoi, TourismPoiFilters } from '@tourism/domain';

export interface TourismPoiRepo {
  list(filters: TourismPoiFilters): Observable<readonly TourismPoi[]>;
  getById(id: string): Observable<TourismPoi | null>;
  getRoute(input: RouteInput): Observable<RouteSummary>;
}

export const TOURISM_POI_REPO = new InjectionToken<TourismPoiRepo>('TOURISM_POI_REPO');
