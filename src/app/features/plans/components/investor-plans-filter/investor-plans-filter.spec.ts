import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorPlansFilter } from './investor-plans-filter';

describe('InvestorPlansFilter', () => {
  let component: InvestorPlansFilter;
  let fixture: ComponentFixture<InvestorPlansFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorPlansFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorPlansFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
