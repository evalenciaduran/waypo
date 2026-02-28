export interface TourismPoiDto {
  id: string | number;
  name?: string | null;
  city?: string | null;
  category?: string | null;
  lat: number;
  lng: number;
  shortDescription?: string | null;
  imageUrl?: string | null;
  source?: 'osm' | 'opentripmap' | 'internal' | null;
  updatedAt?: string | null;
}
