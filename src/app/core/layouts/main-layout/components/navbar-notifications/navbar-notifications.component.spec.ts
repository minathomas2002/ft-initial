import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarNotificationsComponent } from './navbar-notifications.component';

describe('NavbarNotificationsComponent', () => {
  let component: NavbarNotificationsComponent;
  let fixture: ComponentFixture<NavbarNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
