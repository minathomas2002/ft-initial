import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetButton } from './reset-button';

describe('ResetButton', () => {
  let component: ResetButton;
  let fixture: ComponentFixture<ResetButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
