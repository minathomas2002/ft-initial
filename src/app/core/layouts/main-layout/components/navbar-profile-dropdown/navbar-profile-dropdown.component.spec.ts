import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarProfileDropdownComponent } from './navbar-profile-dropdown.component';

describe('NavbarProfileDropdownComponent', () => {
  let component: NavbarProfileDropdownComponent;
  let fixture: ComponentFixture<NavbarProfileDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarProfileDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarProfileDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
