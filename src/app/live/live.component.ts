import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GeolocationService } from "../geolocation.service";
import { GeoLocation } from "../models/GeoLocation";
import { formatNumberValue, formatDurationValue, formatTimeValue } from "../utils/format";
import { TabsService } from "../tabs.service";
import { Tab, LiveStatus, AppSettingsKey, AppSettingsDefaultValue, InfoMeteo } from "../models/types";
import { HeartrateService } from "../heartrate.service";
import { CadenceService } from "../cadence.service";
import { TextToSpeechService } from '../text-to-speech.service'
import * as moment from 'moment'
import * as appSettings from 'tns-core-modules/application-settings'
import { localize } from "nativescript-localize/angular";
import { BehaviorSubject, Observable, interval} from 'rxjs'

const trace = require("trace");

@Component({
    selector: "Live",
    templateUrl: "./live.component.html",
    styleUrls: ["./live.component.scss"]
})
export class LiveComponent implements OnInit {

    @ViewChild('durationLabel', { static: false }) durationLabel: ElementRef;
    @ViewChild('startingCountdownLabel', { static: false }) startingCountdownLabel: ElementRef;

    private readonly _STARTING_COUNTDOWN: number = 5

    speed: string
    average: string
    distance: string
    dem: string
    gradient: string
    duration: string
    time: string
    bpm: string
    rpm: string
    startingCountdown: number;
    temperature: string;
    weatherIcon: string;

    restoreDialogOpen: boolean = false
    stopDialogOpen: boolean = false

    private _starting: boolean = false

    //update meteo every 5 minutes 
    private meteoIntervalObservable: Observable<number> = interval(60 * 1 * 1000)


    constructor(
        private geolocationService: GeolocationService,
        private tabsService: TabsService,
        private heartrateService: HeartrateService,
        private cadenceService: CadenceService,
        private textToSpeechService: TextToSpeechService) {
    }

    restorePendingTrack() {
        this.geolocationService.restoreLiveTrack()
        this.closeRestoreDialogOpen()
    }

    removePendingTrack() {
        this.geolocationService.removeLiveTrack()
        this.closeRestoreDialogOpen()
    }

    ngOnInit() {
 
        this.heartrateService.getBpmObservable().subscribe(bpm => this._updateBpm(bpm))
        this.cadenceService.getRpmObservable().subscribe(rpm => this._updateRpm(rpm))

        this.geolocationService.getLocationObservable().subscribe(location => this._updateLocation(location))
        this.geolocationService.getTimeObservable().subscribe(() => this._updateTime())
        this.geolocationService.getDemObservable().subscribe((demInfo: [number, number]) => this._updateDem(demInfo))
        //this.geolocationService.getStartStopObservable().subscribe((liveStatus: LiveStatus) => this._startStop(liveStatus))
        this.meteoIntervalObservable.subscribe(
            () => {
              this.geolocationService.updateMeteo((infoMeteo) => {
                this._updateMeteo(infoMeteo)
              })
            }
        )
        this.geolocationService.updateMeteo((infoMeteo) => {
            this._updateMeteo(infoMeteo)
        })
        this.tabsService.getAppStatusObserver().subscribe(async () => {
            if (this.tabsService.isStarted() && await this.geolocationService.existsLiveTrack()) {
                this.showRestoreDialogOpen()
                trace.write(`live: restore live track?`, trace.categories.Debug)
            }
        })
    }

    async start() {
        if (appSettings.getBoolean(AppSettingsKey.COUNTDOWN,JSON.parse(AppSettingsDefaultValue.COUNTDOWN))) {
            this._starting = true
            await this._animateStarting()
        }
        await this.geolocationService.start()
        this._starting = false
        this._updateTime()
        trace.write('live.start()', trace.categories.Debug)
    }

    restartHeartRate() {
        this.heartrateService.restart()
    }

    restartCadence() {
        this.cadenceService.restart()
    }


    pause() {
        this.geolocationService.pause()
        this._animatePause()
        trace.write('live.pause()', trace.categories.Debug)
    }

    resume() {
        this.geolocationService.resume()
        trace.write('live.resume()', trace.categories.Debug)
    }

    async stop(result:boolean = null) {
        if (result === null) {
            this.showStopDialogOpen()
        }
        else {
            const trackId: string = await this.geolocationService.stop(result)
            trace.write(`live.stop() ${trackId}`, trace.categories.Debug)
            if (result === true) {
                this.tabsService.openTrack(trackId)
            }
            this.closeStopDialogOpen()
        }
    }

    isStarted() {
        return this.geolocationService.getLiveTrack().isStarted()
    }

    isPaused() {
        return this.geolocationService.getLiveTrack().isPaused()
    }

    visibleIfStartedNotPaused() {
        return this.isStarted() && !this.isPaused() && !this.stopDialogOpen? 'visible' : 'collapse'
    }

    visibleIfStarted() {
        return this.isStarted() && !this.stopDialogOpen? 'visible' : 'collapse'
    }

    visibleIfPaused() {
        return this.isPaused() && !this.stopDialogOpen? 'visible' : 'collapse'
    }

    visibleIfStopped() {
        return this.isStarted() || this._starting ? 'collapse' : 'visible'
    }

    visibleIfStarting() {
        return this._starting ? 'visible' : 'collapse'
    }

    showRestoreDialogOpen() {
        this.restoreDialogOpen = true;
    }

    closeRestoreDialogOpen() {
        this.restoreDialogOpen = false;
    }

    showStopDialogOpen() {
        this.stopDialogOpen = true;
    }

    closeStopDialogOpen() {
        this.stopDialogOpen = false;
    }

    // private _startStop(liveStatus: LiveStatus): void {
    //     //trace.write(`live._startStop: ${liveStatus}`, trace.categories.Debug)
    //     if (liveStatus == LiveStatus.PAUSED) {
    //         this.pause()
    //         this.textToSpeechService.speak(localize('Paused'))
    //     }
    //     else if (liveStatus == LiveStatus.RESUMED) {
    //         this.resume()
    //         this.textToSpeechService.speak(localize('Resumed'))
    //     }
    // }

    private _updateTime() {
        if (this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.TRACK &&
            this.isStarted()) {

            this.time = formatTimeValue(moment())
            this.duration = formatDurationValue(this.geolocationService.getLiveTrack().duration)
            trace.write('live._updateTime: time ' + this.time + ',duration ' + this.duration, trace.categories.Debug)
        }
    }

    private _updateMeteo(infoMeteo: InfoMeteo) {
        if (!infoMeteo.weathercode) {
            this.temperature = `${formatNumberValue(infoMeteo.temperature_2m, '1.0-0')}°`
        }
        let weather:String = ''
        if (infoMeteo.weathercode == 0) {
            weather = 'SUN'
            this.weatherIcon = String.fromCharCode(parseInt('f185', 16))
        } else if ((infoMeteo.weathercode >= 1 && infoMeteo.weathercode <=3) || (infoMeteo.weathercode >= 11 && infoMeteo.weathercode <=19)) {
            weather = 'CLOUDLY'
            this.weatherIcon = String.fromCharCode(parseInt('f0c2', 16))
        } else if ((infoMeteo.weathercode >= 4 && infoMeteo.weathercode >=11) || (infoMeteo.weathercode >= 40 && infoMeteo.weathercode <=49)) {
            weather = 'FOG'
            this.weatherIcon = String.fromCharCode(parseInt('f75f'))
        } else if (infoMeteo.weathercode >= 20 && infoMeteo.weathercode <=29) {
            weather = 'SUNNY CLOUDLY'
            this.weatherIcon = String.fromCharCode(parseInt('f743'))
        } else if (infoMeteo.weathercode >= 50 && infoMeteo.weathercode <=69) {
            weather = 'RAIN'
            this.weatherIcon = String.fromCharCode(parseInt('f73d'))
        } else if (infoMeteo.weathercode >= 70 && infoMeteo.weathercode <=79) {
            weather = 'HEAVY RAIN'
            this.weatherIcon = String.fromCharCode(parseInt('f740'))
        } else if (infoMeteo.weathercode >= 80 && infoMeteo.weathercode <=99) {
            weather = 'STORM'
            this.weatherIcon = String.fromCharCode(parseInt('f75a'))
        } 
        trace.write(`live._updateMeteo: temperature ${this.temperature} weather ${weather}`, trace.categories.Debug)
    }

    private _updateDem(demInfo: [number, number]) {
        if (this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.TRACK &&
            this.isStarted()) {
            this.dem = formatNumberValue(demInfo[0], '1.0-0')
            this.gradient = formatNumberValue(demInfo[1], '1.1-1')
            trace.write('live._updateDem: dem ' + this.dem + ' gradient ' + this.gradient, trace.categories.Debug)
        }
    }

    private _updateBpm(bpm: number) {
        this.bpm = bpm != null ? formatNumberValue(bpm, '1.0-0') : "-"
    }

    private _updateRpm(rpm: number) {
        this.rpm = rpm != null ? formatNumberValue(rpm, '1.0-0') : "-"
    }

    private _updateLocation(location) {
        if (location &&
            this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.TRACK) {
            this.speed = formatNumberValue(this.geolocationService.getLiveTrack().speed)
            this.average = formatNumberValue(this.geolocationService.getLiveTrack().average)
            this.distance = formatNumberValue(this.geolocationService.getLiveTrack().distance)
            trace.write('track: update speed ' + this.speed + ', average ' + this.average + ', distance ' + this.distance, trace.categories.Debug)
        }
    }

    private async _animatePause() {
        if (this.isPaused()) {
            await this.durationLabel.nativeElement.animate(
                {
                    duration: 500,
                    opacity: 0,
                }
            )
            await this.durationLabel.nativeElement.animate(
                {
                    duration: 500,
                    opacity: 1,
                }
            )
            this._animatePause()
        }
    }

    private async _animateStarting() {
        this.startingCountdown = this._STARTING_COUNTDOWN
        for (; this.startingCountdown >= 0; this.startingCountdown--) {
            this.textToSpeechService.speak(this.startingCountdown == 0? localize('liftoff!'): `${this.startingCountdown}`)
            await this.startingCountdownLabel.nativeElement.animate(
                {
                    duration: 500,
                    opacity: 1,
                }
            )
            await this.startingCountdownLabel.nativeElement.animate(
                {
                    duration: 500,
                    opacity: 0,
                }
            )
        }
    }
}