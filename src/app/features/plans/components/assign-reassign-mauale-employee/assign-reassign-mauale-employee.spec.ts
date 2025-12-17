import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignReassignMaualeEmployee } from './assign-reassign-mauale-employee';

describe('AssignReassignMaualeEmployee', () => {
  let component: AssignReassignMaualeEmployee;
  let fixture: ComponentFixture<AssignReassignMaualeEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignReassignMaualeEmployee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignReassignMaualeEmployee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
