import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarNotificationsTabs } from './navbar-notifications-tabs';

describe('NotificationsTabs', () => {
  let component: NavbarNotificationsTabs;
  let fixture: ComponentFixture<NavbarNotificationsTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarNotificationsTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarNotificationsTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
