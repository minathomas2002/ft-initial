import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTagComponent } from './base-tag.component';

describe('BaseTagComponent', () => {
  let component: BaseTagComponent;
  let fixture: ComponentFixture<BaseTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
