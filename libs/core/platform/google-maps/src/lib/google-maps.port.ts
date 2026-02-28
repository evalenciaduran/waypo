import { InjectionToken } from '@angular/core';
import { GeoPoint, RouteSummary, TourismPoi } from '@tourism/domain';

export interface GoogleMapsPort {
  mountMap(host: HTMLElement, center: GeoPoint, zoom: number): Promise<void>;
  setPois(pois: readonly TourismPoi[]): Promise<void>;
  highlightPoi(poiId: string): Promise<void>;
  drawRoute(route: RouteSummary): Promise<void>;
}

export const GOOGLE_MAPS_PORT = new InjectionToken<GoogleMapsPort>('GOOGLE_MAPS_PORT');
