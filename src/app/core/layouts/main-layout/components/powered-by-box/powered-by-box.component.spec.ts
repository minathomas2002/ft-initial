import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoweredByBoxComponent } from './powered-by-box.component';

describe('PoweredByBoxComponent', () => {
  let component: PoweredByBoxComponent;
  let fixture: ComponentFixture<PoweredByBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoweredByBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoweredByBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
