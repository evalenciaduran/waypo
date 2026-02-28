import { TestBed } from '@angular/core/testing';
import { TourismPoiListComponent } from './tourism-poi-list.component';

describe('TourismPoiListComponent', () => {
  it('creates component', () => {
    TestBed.configureTestingModule({
      imports: [TourismPoiListComponent],
    });

    const fixture = TestBed.createComponent(TourismPoiListComponent);
    fixture.componentInstance.pois = [];
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
