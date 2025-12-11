import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotificationDialog } from './admin-notification-dialog';

describe('AdminNotificationDialog', () => {
  let component: AdminNotificationDialog;
  let fixture: ComponentFixture<AdminNotificationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotificationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
