import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { TourismMapPageContainer } from './tourism-map-page.container';
import { TourismMapStore } from '../state/tourism-map.store';
import { IonicModule } from '@ionic/angular';

describe('TourismMapPageContainer', () => {
  it('creates component and requests initial POI load', () => {
    const storeMock = {
      vm: signal({
        loading: false,
        pois: [],
        selectedPoi: null,
        route: null,
        error: null,
      }),
      loadPois: vi.fn(),
      selectPoi: vi.fn(),
      calculateRoute: vi.fn(),
      clearError: vi.fn(),
    } as unknown as TourismMapStore;

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TourismMapPageContainer],
      providers: [{ provide: TourismMapStore, useValue: storeMock }],
    });

    const fixture = TestBed.createComponent(TourismMapPageContainer);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(storeMock.loadPois).toHaveBeenCalled();
  });
});
