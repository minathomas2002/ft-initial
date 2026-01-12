import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorPlansActionMenu } from './investor-plans-action-menu';

describe('InvestorPlansActionMenu', () => {
  let component: InvestorPlansActionMenu;
  let fixture: ComponentFixture<InvestorPlansActionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorPlansActionMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorPlansActionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
