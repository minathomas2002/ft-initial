import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIdentify } from './user-identify';

describe('UserIdentify', () => {
  let component: UserIdentify;
  let fixture: ComponentFixture<UserIdentify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserIdentify]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserIdentify);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
