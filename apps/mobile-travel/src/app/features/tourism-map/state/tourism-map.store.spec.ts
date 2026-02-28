import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TOURISM_POI_REPO, TourismPoiRepo } from '../data-access/ports/tourism-poi.repo';
import { TourismMapStore } from './tourism-map.store';

describe('TourismMapStore', () => {
  it('loads pois successfully', () => {
    const repoMock: TourismPoiRepo = {
      list: () =>
        of([
          {
            id: '1',
            name: 'POI 1',
            city: 'Madrid',
            category: 'museum',
            location: { lat: 40.1, lng: -3.7 },
            shortDescription: 'Desc',
            source: 'internal',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ]),
      getById: () => of(null),
      getRoute: () => of({ distanceMeters: 1000, durationSeconds: 600 }),
    };

    TestBed.configureTestingModule({
      providers: [TourismMapStore, { provide: TOURISM_POI_REPO, useValue: repoMock }],
    });

    const store = TestBed.inject(TourismMapStore);
    store.loadPois({ city: 'Madrid' });

    const vm = store.vm();
    expect(vm.error).toBeNull();
    expect(vm.pois.length).toBe(1);
  });

  it('exposes error on load failure', () => {
    const repoMock: TourismPoiRepo = {
      list: () => throwError(() => new Error('boom')),
      getById: () => of(null),
      getRoute: () => of({ distanceMeters: 1000, durationSeconds: 600 }),
    };

    TestBed.configureTestingModule({
      providers: [TourismMapStore, { provide: TOURISM_POI_REPO, useValue: repoMock }],
    });

    const store = TestBed.inject(TourismMapStore);
    store.loadPois({ city: 'Madrid' });

    const vm = store.vm();
    expect(vm.error).toBeTruthy();
    expect(vm.pois.length).toBe(0);
  });
});
