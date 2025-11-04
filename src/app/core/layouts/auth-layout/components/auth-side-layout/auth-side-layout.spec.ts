import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSideLayout } from './auth-side-layout';

describe('AuthSideLayout', () => {
  let component: AuthSideLayout;
  let fixture: ComponentFixture<AuthSideLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSideLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSideLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
