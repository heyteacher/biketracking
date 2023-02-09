import { Injectable } from '@angular/core';
import { TNSTextToSpeech, SpeakOptions } from 'nativescript-texttospeech';
const trace = require("trace");
import * as platform from "tns-core-modules/platform"


@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  private TTS = new TNSTextToSpeech();

  private speakOptions: SpeakOptions = {
    text: 'Whatever you like', /// *** required ***
    speakRate: 1.0, // optional - default is 1.0
    pitch: 1.0, // optional - default is 1.0
    volume: 1.0, // optional - default is 1.0
    locale: platform.device.language, // optional - default is system locale,
  };

  constructor() { 
    this.speak("")
  }

  async speak(text: string) {
    try {
      trace.write(`textToSpeech: speak '${text}'`, trace.categories.Debug)              
      this.speakOptions.text = text
      await this.TTS.speak(this.speakOptions)      
    } catch (error) {
      trace.write(`textToSpeech: error on speak ${error}`, trace.categories.Error)              
    }
  }
}
