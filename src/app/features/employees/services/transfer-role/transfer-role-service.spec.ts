import { TestBed } from '@angular/core/testing';
import { TransferRoleService } from './transfer-role-service';



describe('TransferRoleService', () => {
  let service: TransferRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
