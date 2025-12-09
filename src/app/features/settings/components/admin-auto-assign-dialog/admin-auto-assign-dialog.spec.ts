import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAutoAssignDialog } from './admin-auto-assign-dialog';

describe('AdminAutoAssignDialog', () => {
  let component: AdminAutoAssignDialog;
  let fixture: ComponentFixture<AdminAutoAssignDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAutoAssignDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAutoAssignDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
