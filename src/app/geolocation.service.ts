import { Injectable, OnDestroy, OnInit } from '@angular/core'
import * as geolocation from 'nativescript-geolocation'
import { Accuracy } from 'tns-core-modules/ui/enums'
import { keepAwake, allowSleepAgain } from 'nativescript-insomnia';
import { StoreService } from './store.service'
import { Track } from './models/Track'
import { LiveTrack } from "./models/LiveTrack"
import { BehaviorSubject, Observable, interval, Subscription, timer } from 'rxjs'
import { TabsService } from './tabs.service'
import { HttpClient } from '@angular/common/http'
import { GeoLocation } from './models/GeoLocation';
import { InfoMeteo, LiveStatus, AppSettingsKey, AppSettingsDefaultValue } from './models/types';
import { HeartrateService } from './heartrate.service';
import { CadenceService } from './cadence.service';
import { humanizeTime, formatNumberValue, humanizeDuration } from './utils/format';
import * as moment from 'moment'
import { TextToSpeechService } from "./text-to-speech.service";
import * as appSettings from 'tns-core-modules/application-settings'
import { localize } from 'nativescript-localize/angular';

const trace = require("trace");

@Injectable({
  providedIn: 'root'
})
export class GeolocationService implements OnDestroy {

  private liveTrack: LiveTrack = new LiveTrack()

  private liveLocationSubject = new BehaviorSubject<GeoLocation>(null)
  private watchLocation: number = null

  private timeObservable: Observable<number> = interval(15000)


  private autoSaveObservable: Observable<number> = interval(60000)
  private autoSaveSubscription: Subscription = null

  private demIntervalObservable: Observable<number> = interval(30000)
  private demIntervalSubscription: Subscription = null
  private demSubject = new BehaviorSubject<[number, number]>(null)

  private liveStatusSubject = new BehaviorSubject<LiveStatus>(null)
  //private startStopSubject = new BehaviorSubject<LiveStatus>(null)

  private voiceSummarySubscription: Subscription

  private voiceSummaryTimer: Observable<number>;

  constructor(
    private storeService: StoreService,
    private tabsService: TabsService,
    private heartrateService: HeartrateService,
    private cadenceService: CadenceService,
    private textToSpeechService: TextToSpeechService,
    private httpClient: HttpClient) {
    this.tabsService.getAppStatusObserver().subscribe(() => {
      this._updateLiveData();
    })
    this.tabsService.getSelectedTabObserver().subscribe(() => {
      this._updateLiveData();
    })
    this.getLocationObservable().subscribe(location => {
      if (location != null) {
        trace.write(`geolocation: new location [${location.latitude}, ${location.longitude}]`, trace.categories.Debug)
        this.liveTrack.addLocation(location/*, this.startStopSubject*/)
        if (this.tabsService.isAppOpen()) {
          if (this.liveTrack.getLiveLocations().length == 1) {
            this.liveTrack.updateDem(this.httpClient, this.demSubject)
          }
        }
      }
    })
    this.heartrateService.getBpmObservable().subscribe(bpm => this.liveTrack.updateBpm(bpm))
    this.cadenceService.getRpmObservable().subscribe(rpm => this.liveTrack.updateRpm(rpm))
    this.timeObservable.subscribe(() => this._updateTime());
  }

  async existsLiveTrack(): Promise<boolean> {
    return this.storeService.existsLiveTrack()
  }

  removeLiveTrack() {
    this.storeService.removeLiveTrack()
  }

  async restoreLiveTrack() {
    const liveTrack: LiveTrack = await this.storeService.getLiveTrack()
    if (liveTrack) {
      trace.write('geolocation.restoreLiveTrack', trace.categories.Debug)
      await this.start()
      this.liveTrack = liveTrack
      this.liveTrack.updateDuration()
      this.liveTrack.updateDem(this.httpClient, this.demSubject)
    }
  }

  getTimeObservable(): Observable<number> {
    return this.timeObservable
  }

  getDemObservable(): Observable<[number, number]> {
    return this.demSubject.asObservable()
  }

  getLocationObservable(): Observable<GeoLocation> {
    return this.liveLocationSubject.asObservable();
  }

  getLiveStatusObservable(): Observable<LiveStatus> {
    return this.liveStatusSubject.asObservable();
  }

  // getStartStopObservable(): Observable<LiveStatus> {
  //   return this.startStopSubject.asObservable()
  // }

  async start() {
    try {
      await this._enable()
      this.liveTrack.start()
      this._startWatch()
      // keep awake
      if (appSettings.getBoolean(AppSettingsKey.DISPLAY_ALWAYS_ON, JSON.parse(AppSettingsDefaultValue.DISPLAY_ALWAYS_ON))) {
        trace.write('DISPLAY_ALWAYS_ON true: keepAwake ', trace.categories.Debug)
        await keepAwake()
      }
      this.heartrateService.start()
      this.liveStatusSubject.next(LiveStatus.STARTED)
      this.startVoiceSummaryTimer()
    } catch (ex) {
      trace.write('geolocation.start: error: ' + ex.message, trace.categories.Error)
    }
  }

  startVoiceSummaryTimer() {
    this._stopVoiceSummaryTimer()
    const voiceSummaryTypeInterval: number = appSettings.getNumber(
      AppSettingsKey.VOICE_SUMMARY_TIME_INTERVAL_MIN,
      parseInt(AppSettingsDefaultValue.VOICE_SUMMARY_TIME_INTERVAL_MIN)) * 60 * 1000
    if (voiceSummaryTypeInterval > 0) {
      this.voiceSummaryTimer = timer(voiceSummaryTypeInterval, voiceSummaryTypeInterval)
      this.voiceSummarySubscription = this.voiceSummaryTimer.subscribe(() => this._speak())
    }
  }

  private _stopVoiceSummaryTimer() {
    if (this.voiceSummarySubscription) {
      this.voiceSummarySubscription.unsubscribe()
    }
    this.voiceSummarySubscription = null
    this.voiceSummaryTimer = null
  }

  async pause() {
    if (this.liveTrack.isStarted()) {
      //this._stopWatch()
      this.liveTrack.pause()
      this.liveStatusSubject.next(LiveStatus.PAUSED)
    }
  }

  async resume() {
    if (this.liveTrack.isPaused()) {
      this._startWatch()
      this.liveTrack.resume()
      this.liveStatusSubject.next(LiveStatus.RESUMED)
    }
  }

  async stop(isToSave: boolean): Promise<string> {
    await allowSleepAgain()
    this._stopVoiceSummaryTimer()
    this.resume()
    this._stopWatch()
    this.storeService.removeLiveTrack()
    await this.heartrateService.stop()
    let trackKey = null
    trace.write('geolocation.stop: isToSave ' + isToSave, trace.categories.Debug)
    if (isToSave) {
      const track: Track = this.liveTrack.getTrack(true)
      LiveTrack.computeTrackInfo(track)
      trace.write('geolocation.stop: addTrack(' + track.key + ') try...', trace.categories.Debug)
      await this.storeService.addTrack(track)
      trackKey = track.key
    }
    this.liveTrack.stop()
    this.liveStatusSubject.next(LiveStatus.STOPPED)
    return trackKey
  }

  getCurrentLocation() {
    return geolocation.getCurrentLocation(GeolocationService._locationOptions)
  }

  getLiveTrack() {
    return this.liveTrack
  }

  ngOnDestroy() {
    if (this.watchLocation) geolocation.clearWatch(this.watchLocation)
  }

  private _updateLiveData() {
    this.liveTrack.updateDuration();
    this.liveTrack.updateDem(this.httpClient, this.demSubject);
  }

  private _updateTime() {
    this.liveTrack.updateDuration();
    const gpsUpdateTimeMs:number = appSettings.getNumber(AppSettingsKey.GPS_UPDATE_TIME_SEC, JSON.parse(AppSettingsDefaultValue.GPS_UPDATE_TIME_SEC)) * 1000
    const lastLocationTimestamp: string = this.liveTrack.getLastLocationValue('timestamp')

    // if (!this.liveTrack.isPaused() &&
    //   this.liveTrack.isStarted() &&
    //   appSettings.getBoolean(AppSettingsKey.AUTOMATIC_START_STOP, JSON.parse(AppSettingsDefaultValue.AUTOMATIC_START_STOP)) &&
    //   lastLocationTimestamp &&
    //   this.liveTrack.getLiveLocations().length > 20 &&
    //   moment().diff(moment(lastLocationTimestamp)) > gpsUpdateTimeMs) {
    //   const locationIntervalTime = moment().diff(moment(lastLocationTimestamp)) 
    //   //this.startStopSubject.next(LiveStatus.PAUSED)
    //   trace.write(`Geolocation._updateTime(): startStop PAUSED. locationIntervalTime ${locationIntervalTime} `, trace.categories.Debug)
    // }
  }

  private async _enable() {
    try {
      const isEnabled = await geolocation.isEnabled()
      if (!isEnabled) {
        const enableLocationResponse = await geolocation.enableLocationRequest()
        trace.write(`geolocation.enable: enableLocationRequest ${enableLocationResponse}`, trace.categories.Debug)
      }
    } catch (e) {
      trace.write('geolocation.enable: error: ' + (e.message || e), trace.categories.Error)
    }
  }

  private _startWatch() {
    trace.write('geolocation._startWatch: watchLocation', trace.categories.Debug)
    this.watchLocation = geolocation.watchLocation(
      location => this.liveLocationSubject.next(location),
      e => trace.write('geolocation.start: watchLocation error: ' + e.message, trace.categories.Error),
      GeolocationService._locationOptions
    )
    this.autoSaveSubscription = this.autoSaveObservable.subscribe(
      () => this.storeService.updateLiveTrack(this.liveTrack.getTrack())
    )
    this.demIntervalSubscription = this.demIntervalObservable.subscribe(
      () => {
        this.liveTrack.updateDem(this.httpClient, this.demSubject)
      }
    )

    //this.getMeteoObservable().subscribe((infoMeteo:InfoMeteo) => {
    //  trace.write('geolocation.getMeteoObservable().subscribe: InfoMeteo ' + infoMeteo, trace.categories.Debug)
    //})
  }

  async updateMeteo(callback) {
    this.liveTrack.updateMeteo(this.httpClient, await this.getCurrentLocation(), callback)
  }

  private _stopWatch() {
    if (this.watchLocation != null) {
      geolocation.clearWatch(this.watchLocation)
      this.watchLocation = null
      trace.write('geolocation._stopWatch: clearWatch', trace.categories.Debug)
    }
    if (this.autoSaveSubscription) this.autoSaveSubscription.unsubscribe()
    if (this.demIntervalSubscription) this.demIntervalSubscription.unsubscribe()
  }

  private static _locationOptions: geolocation.Options = {
    desiredAccuracy: appSettings.getBoolean(
      AppSettingsKey.GPS_HIGH_ACCURACY,JSON.parse(AppSettingsDefaultValue.GPS_HIGH_ACCURACY)) ? 
      Accuracy.high : 
      Accuracy.any,
    updateDistance: appSettings.getNumber(
      AppSettingsKey.GPS_UPDATE_DISTANCE_MT, 
      parseInt(AppSettingsDefaultValue.GPS_UPDATE_DISTANCE_MT)),
    updateTime: appSettings.getNumber(
      AppSettingsKey.GPS_UPDATE_TIME_SEC, 
      parseInt(AppSettingsDefaultValue.GPS_UPDATE_TIME_SEC)) * 1000,
    minimumUpdateTime: appSettings.getNumber(
      AppSettingsKey.GPS_MINIMUM_UPDATE_TIME_SEC, 
      parseInt(AppSettingsDefaultValue.GPS_MINIMUM_UPDATE_TIME_SEC)) * 1000
  }

  private _speak(): any {
    if (this.liveTrack.isStarted()) {
      this.liveTrack.updateDuration()
      this.textToSpeechService.speak(
        localize('time %s, duration %s, distance %s kilometers, average %s kilometers per hour',
          humanizeTime(), 
          humanizeDuration(moment.duration(this.liveTrack.duration)),
          formatNumberValue(this.liveTrack.distance),
          formatNumberValue(this.liveTrack.average)
        )
      );
    }
  }

}
