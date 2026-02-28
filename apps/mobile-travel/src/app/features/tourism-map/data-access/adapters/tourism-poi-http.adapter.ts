import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RouteInput, RouteSummary, TourismPoi, TourismPoiFilters } from '@tourism/domain';
import { TourismPoiRepo } from '../ports/tourism-poi.repo';
import { TourismPoiDto } from '../models/tourism-poi.dto';
import { mapTourismPoiDto } from '../models/tourism-poi.mapper';

@Injectable()
export class TourismPoiHttpAdapter implements TourismPoiRepo {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  list(filters: TourismPoiFilters): Observable<readonly TourismPoi[]> {
    let params = new HttpParams();

    if (filters.city) {
      params = params.set('city', filters.city);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit);
    }
    if (filters.bounds) {
      params = params
        .set('neLat', filters.bounds.northEast.lat)
        .set('neLng', filters.bounds.northEast.lng)
        .set('swLat', filters.bounds.southWest.lat)
        .set('swLng', filters.bounds.southWest.lng);
    }

    return this.http
      .get<readonly TourismPoiDto[]>(`${this.baseUrl}/v1/pois`, { params })
      .pipe(map((rows) => rows.map(mapTourismPoiDto)));
  }

  getById(id: string): Observable<TourismPoi | null> {
    return this.http
      .get<TourismPoiDto | null>(`${this.baseUrl}/v1/pois/${id}`)
      .pipe(map((row) => (row ? mapTourismPoiDto(row) : null)));
  }

  getRoute(input: RouteInput): Observable<RouteSummary> {
    const params = new HttpParams()
      .set('origin', `${input.origin.lat},${input.origin.lng}`)
      .set('destination', `${input.destination.lat},${input.destination.lng}`)
      .set('mode', input.mode);

    return this.http.get<RouteSummary>(`${this.baseUrl}/v1/routes`, { params });
  }
}
