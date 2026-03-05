import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityAuditDetails } from './opportunity-audit-details';

describe('OpportunityAuditDetails', () => {
  let component: OpportunityAuditDetails;
  let fixture: ComponentFixture<OpportunityAuditDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityAuditDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityAuditDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
