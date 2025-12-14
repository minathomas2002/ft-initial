import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSettingView } from './admin-setting-view';

describe('AdminSettingView', () => {
  let component: AdminSettingView;
  let fixture: ComponentFixture<AdminSettingView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSettingView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSettingView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
