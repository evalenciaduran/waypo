export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MapBounds {
  northEast: GeoPoint;
  southWest: GeoPoint;
}

export interface RouteInput {
  origin: GeoPoint;
  destination: GeoPoint;
  mode: 'driving' | 'walking' | 'transit';
}

export interface RouteSummary {
  distanceMeters: number;
  durationSeconds: number;
  polyline?: string;
}

export interface TourismPoi {
  id: string;
  name: string;
  city: string;
  category: string;
  location: GeoPoint;
  shortDescription: string;
  imageUrl?: string;
  source: 'osm' | 'opentripmap' | 'internal';
  updatedAt: string;
}

export interface TourismPoiFilters {
  city?: string;
  category?: string;
  bounds?: MapBounds;
  limit?: number;
}
