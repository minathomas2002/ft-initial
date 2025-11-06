import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { UsersActionMenu } from "./users-action-menu";

describe("UsersActionMenu", () => {
  let component: UsersActionMenu;
  let fixture: ComponentFixture<UsersActionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersActionMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersActionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
