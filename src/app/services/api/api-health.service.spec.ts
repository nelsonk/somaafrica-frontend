import { TestBed } from '@angular/core/testing';

import { ApiHealthService } from './api-health.service';

describe('ApiHealthService', () => {
  let service: ApiHealthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiHealthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
