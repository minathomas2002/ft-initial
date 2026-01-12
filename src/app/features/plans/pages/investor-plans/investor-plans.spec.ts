import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorPlans } from './investor-plans';

describe('InvestorPlans', () => {
  let component: InvestorPlans;
  let fixture: ComponentFixture<InvestorPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
