import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegationActionMenu } from './delegation-action-menu';

describe('DelegationActionMenu', () => {
  let component: DelegationActionMenu;
  let fixture: ComponentFixture<DelegationActionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelegationActionMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelegationActionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
