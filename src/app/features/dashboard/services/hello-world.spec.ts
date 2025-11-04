import { TestBed } from '@angular/core/testing';

import { HelloWorld } from './hello-world';

describe('HelloWorld', () => {
  let service: HelloWorld;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelloWorld);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
