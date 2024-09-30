import { TestBed } from '@angular/core/testing';

import { Erc20Service } from './erc20.service';

describe('Erc20Service', () => {
  let service: Erc20Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Erc20Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
