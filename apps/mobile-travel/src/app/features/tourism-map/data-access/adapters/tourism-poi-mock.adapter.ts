import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RouteInput, RouteSummary, TourismPoi, TourismPoiFilters } from '@tourism/domain';
import { TourismPoiRepo } from '../ports/tourism-poi.repo';

@Injectable()
export class TourismPoiMockAdapter implements TourismPoiRepo {
  private readonly rows: readonly TourismPoi[] = [
    {
      id: 'madrid-prado',
      name: 'Museo del Prado',
      city: 'Madrid',
      category: 'museum',
      location: { lat: 40.4138, lng: -3.6921 },
      shortDescription: 'Una de las principales pinacotecas del mundo.',
      source: 'internal',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'barcelona-sagrada-familia',
      name: 'Sagrada Familia',
      city: 'Barcelona',
      category: 'landmark',
      location: { lat: 41.4036, lng: 2.1744 },
      shortDescription: 'Basílica emblemática diseñada por Antoni Gaudí.',
      source: 'internal',
      updatedAt: new Date().toISOString(),
    },
  ];

  list(filters: TourismPoiFilters): Observable<readonly TourismPoi[]> {
    const filtered = this.rows.filter((poi) => {
      if (filters.city && filters.city.toLowerCase() !== 'spain' && poi.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      if (filters.category && poi.category !== filters.category) {
        return false;
      }
      return true;
    });

    return of(filtered.slice(0, filters.limit ?? 50));
  }

  getById(id: string): Observable<TourismPoi | null> {
    return of(this.rows.find((poi) => poi.id === id) ?? null);
  }

  getRoute(_input: RouteInput): Observable<RouteSummary> {
    return of({
      distanceMeters: 5200,
      durationSeconds: 1080,
      polyline: '',
    });
  }
}
