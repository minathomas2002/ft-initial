import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseLabelComponent } from './base-label.component';

describe('BaseLabelComponent', () => {
  let component: BaseLabelComponent;
  let fixture: ComponentFixture<BaseLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
