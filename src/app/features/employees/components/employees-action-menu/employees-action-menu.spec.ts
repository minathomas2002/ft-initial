import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { EmployeesActionMenu } from "./employees-action-menu";

describe("EmployeesActionMenu", () => {
  let component: EmployeesActionMenu;
  let fixture: ComponentFixture<EmployeesActionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesActionMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesActionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

