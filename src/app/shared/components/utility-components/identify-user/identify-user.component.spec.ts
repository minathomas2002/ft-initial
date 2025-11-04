import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyUserComponent } from './identify-user.component';

describe('IdentifyUserComponent', () => {
  let component: IdentifyUserComponent;
  let fixture: ComponentFixture<IdentifyUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentifyUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentifyUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
