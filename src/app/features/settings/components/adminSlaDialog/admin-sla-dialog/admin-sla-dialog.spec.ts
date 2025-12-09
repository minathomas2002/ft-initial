import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSlaDialog } from './admin-sla-dialog';

describe('AdminSlaDialog', () => {
  let component: AdminSlaDialog;
  let fixture: ComponentFixture<AdminSlaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSlaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSlaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
