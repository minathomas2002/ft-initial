import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityDetailItem } from './opportunity-detail-item';

describe('OpportunityDetailItem', () => {
  let component: OpportunityDetailItem;
  let fixture: ComponentFixture<OpportunityDetailItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityDetailItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityDetailItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
