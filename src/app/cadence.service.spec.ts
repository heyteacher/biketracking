import { TestBed } from '@angular/core/testing';

import { CadenceService } from './cadence.service';

describe('CadenceService', () => {
  let service: CadenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new CadenceService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
