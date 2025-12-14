import { TestBed } from '@angular/core/testing';

import { EmailNotificationFormService } from './email-notification-form-service';

describe('EmailNotificationFormService', () => {
  let service: EmailNotificationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailNotificationFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
