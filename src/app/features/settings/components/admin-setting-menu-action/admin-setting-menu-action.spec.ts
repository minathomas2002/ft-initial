import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSettingMenuAction } from './admin-setting-menu-action';

describe('AdminSettingMenuAction', () => {
  let component: AdminSettingMenuAction;
  let fixture: ComponentFixture<AdminSettingMenuAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSettingMenuAction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSettingMenuAction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
