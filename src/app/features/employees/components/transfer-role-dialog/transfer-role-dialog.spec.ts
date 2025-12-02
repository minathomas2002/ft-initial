import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferRoleDialog } from './transfer-role-dialog';

describe('TransferRoleDialog', () => {
  let component: TransferRoleDialog;
  let fixture: ComponentFixture<TransferRoleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferRoleDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferRoleDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
