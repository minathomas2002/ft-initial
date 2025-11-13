import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityDetailsCardInfoItem } from './opportunity-details-card-info-item';

describe('OpportunityDetailsCardInfoItem', () => {
  let component: OpportunityDetailsCardInfoItem;
  let fixture: ComponentFixture<OpportunityDetailsCardInfoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityDetailsCardInfoItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OpportunityDetailsCardInfoItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
