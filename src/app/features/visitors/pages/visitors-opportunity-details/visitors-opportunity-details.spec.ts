import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorsOpportunityDetails } from './visitors-opportunity-details';

describe('VisitorsOpportunityDetails', () => {
  let component: VisitorsOpportunityDetails;
  let fixture: ComponentFixture<VisitorsOpportunityDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorsOpportunityDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorsOpportunityDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
