import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansActionMenu } from './plans-action-menu';

describe('PlansActionMenu', () => {
  let component: PlansActionMenu;
  let fixture: ComponentFixture<PlansActionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansActionMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansActionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
