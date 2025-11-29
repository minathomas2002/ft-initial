import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesFilter } from './employees-filter';

describe('EmployeesFilter', () => {
  let component: EmployeesFilter;
  let fixture: ComponentFixture<EmployeesFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

