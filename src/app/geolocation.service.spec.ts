import { TestBed } from '@angular/core/testing';

import { GeolocationService } from './geolocation.service';

describe('GeolocationService', () => {
  let service: GeolocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new GeolocationService(null, null, null, null, null, null)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
