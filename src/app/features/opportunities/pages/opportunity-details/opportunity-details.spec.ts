import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityDetails } from './opportunity-details';

describe('OpportunityDetails', () => {
  let component: OpportunityDetails;
  let fixture: ComponentFixture<OpportunityDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityDetails]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OpportunityDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
