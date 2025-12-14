import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaysManagementFilter } from './holidays-management-filter';

describe('HolidaysManagementFilter', () => {
  let component: HolidaysManagementFilter;
  let fixture: ComponentFixture<HolidaysManagementFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaysManagementFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaysManagementFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
