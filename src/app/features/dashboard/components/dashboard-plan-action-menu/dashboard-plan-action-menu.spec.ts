import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPlanActionMenu } from './dashboard-plan-action-menu';

describe('DashboardPlanActionMenu', () => {
  let component: DashboardPlanActionMenu;
  let fixture: ComponentFixture<DashboardPlanActionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPlanActionMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPlanActionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
