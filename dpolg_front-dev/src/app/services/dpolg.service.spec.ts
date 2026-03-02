import { TestBed } from '@angular/core/testing';

import { DpolgService } from './dpolg.service';

describe('DpolgService', () => {
  let service: DpolgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DpolgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
