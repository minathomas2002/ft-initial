import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitiesList } from './opportunities-list';

describe('OpportunitiesList', () => {
  let component: OpportunitiesList;
  let fixture: ComponentFixture<OpportunitiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunitiesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunitiesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
