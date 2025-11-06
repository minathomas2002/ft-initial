import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseLogoComponent } from './base-logo.component';

describe('BaseLogoComponent', () => {
  let component: BaseLogoComponent;
  let fixture: ComponentFixture<BaseLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseLogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
