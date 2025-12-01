import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesView } from './employees-view';

describe('EmployeesView', () => {
  let component: EmployeesView;
  let fixture: ComponentFixture<EmployeesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
