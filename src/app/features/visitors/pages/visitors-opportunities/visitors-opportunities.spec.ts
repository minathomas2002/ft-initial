import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorsOpportunities } from './visitors-opportunities';

describe('VisitorsOpportunities', () => {
  let component: VisitorsOpportunities;
  let fixture: ComponentFixture<VisitorsOpportunities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorsOpportunities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorsOpportunities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
