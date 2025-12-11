import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHolidaysManagementView } from './admin-holidays-management-view';

describe('AdminHolidaysManagementView', () => {
  let component: AdminHolidaysManagementView;
  let fixture: ComponentFixture<AdminHolidaysManagementView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHolidaysManagementView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHolidaysManagementView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
