import { TestBed } from '@angular/core/testing';

import { TextToSpeechService } from './text-to-speech.service';


describe('TextToSpeechService', () => {
  let service: TextToSpeechService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new TextToSpeechService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
