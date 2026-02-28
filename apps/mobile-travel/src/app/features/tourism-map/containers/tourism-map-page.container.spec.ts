import { TestBed } from '@angular/core/testing';
import { TourismMapPageContainer } from './tourism-map-page.container';
import { TourismMapStore } from '../state/tourism-map.store';

describe('TourismMapPageContainer', () => {
  it('creates component and requests initial POI load', () => {
    const storeMock: Partial<TourismMapStore> = {
      vm: () => ({
        loading: false,
        pois: [],
        selectedPoi: null,
        route: null,
        error: null,
      }),
      loadPois: jasmine.createSpy('loadPois'),
      selectPoi: jasmine.createSpy('selectPoi'),
      calculateRoute: jasmine.createSpy('calculateRoute'),
      clearError: jasmine.createSpy('clearError'),
    };

    TestBed.configureTestingModule({
      imports: [TourismMapPageContainer],
      providers: [{ provide: TourismMapStore, useValue: storeMock }],
    });

    const fixture = TestBed.createComponent(TourismMapPageContainer);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(storeMock.loadPois).toHaveBeenCalled();
  });
});
