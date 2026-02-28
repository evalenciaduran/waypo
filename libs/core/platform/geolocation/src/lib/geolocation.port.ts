import { InjectionToken } from '@angular/core';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeolocationPort {
  getCurrentPosition(): Promise<Coordinates>;
}

export const GEOLOCATION_PORT = new InjectionToken<GeolocationPort>('GEOLOCATION_PORT');
