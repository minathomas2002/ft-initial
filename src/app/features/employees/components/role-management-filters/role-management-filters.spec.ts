import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementFilters } from './role-management-filters';

describe('RoleManagementFilters', () => {
  let component: RoleManagementFilters;
  let fixture: ComponentFixture<RoleManagementFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleManagementFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleManagementFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

