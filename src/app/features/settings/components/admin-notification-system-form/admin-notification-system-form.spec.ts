import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotificationForm } from './admin-notification-system-form';

describe('AdminNotificationForm', () => {
  let component: AdminNotificationForm;
  let fixture: ComponentFixture<AdminNotificationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotificationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
