import { TestBed } from '@angular/core/testing';

import { ProductinfoService } from './productinfo.service';

describe('ProductinfoService', () => {
  let service: ProductinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
