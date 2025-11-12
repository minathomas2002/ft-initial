import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorsOpportunitiesFilters } from './visitors-opportunities-filters';

describe('VisitorsOpportunitiesFilters', () => {
  let component: VisitorsOpportunitiesFilters;
  let fixture: ComponentFixture<VisitorsOpportunitiesFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorsOpportunitiesFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorsOpportunitiesFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
