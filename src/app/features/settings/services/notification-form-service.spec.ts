import { TestBed } from '@angular/core/testing';

import { NotificationFormService } from './notification-form-service';

describe('NotificationFormService', () => {
  let service: NotificationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
