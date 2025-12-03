import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementActions } from './role-management-actions';

describe('RoleManagementActions', () => {
  let component: RoleManagementActions;
  let fixture: ComponentFixture<RoleManagementActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleManagementActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleManagementActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
