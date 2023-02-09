import { TestBed } from '@angular/core/testing';

import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new StoreService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
