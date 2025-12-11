import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotificationEmailForm } from './admin-notification-email-form';

describe('AdminNotificationEmailForm', () => {
  let component: AdminNotificationEmailForm;
  let fixture: ComponentFixture<AdminNotificationEmailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationEmailForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotificationEmailForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
