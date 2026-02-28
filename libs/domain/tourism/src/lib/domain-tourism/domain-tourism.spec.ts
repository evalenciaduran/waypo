import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomainTourism } from './domain-tourism';

describe('DomainTourism', () => {
  let component: DomainTourism;
  let fixture: ComponentFixture<DomainTourism>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainTourism]
    }).compileComponents();

    fixture = TestBed.createComponent(DomainTourism);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
