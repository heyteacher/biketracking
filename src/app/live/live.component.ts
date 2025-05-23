import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GeolocationService } from "../geolocation.service";
import { formatNumberValue, formatDurationValue, formatTimeValue } from "../utils/format";
import { TabsService } from "../tabs.service";
import { Tab, AppSettingsKey, AppSettingsDefaultValue, InfoMeteo } from "../models/types";
import { HeartrateService } from "../heartrate.service";
import { CadenceService } from "../cadence.service";
import { TextToSpeechService } from '../text-to-speech.service'
import * as moment from 'moment'
import * as appSettings from 'tns-core-modules/application-settings'
import { localize } from "nativescript-localize/angular";
import { Observable, interval} from 'rxjs'
import { MeteoService } from "../meteo.service";

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
    infoMeteo: InfoMeteo = {
        time: null,
        temperature: null,
        weathercode: null,
        humidity: null,
        icon: null,
        weather:null
    }

    restoreDialogOpen: boolean = false
    stopDialogOpen: boolean = false

    infoMeteoData:InfoMeteo[]


    private _starting: boolean = false

    //update meteo every 10 minutes 
    private meteoIntervalObservable: Observable<number> = interval(10 * 60 * 1 * 1000)


    constructor(
        private geolocationService: GeolocationService,
        private tabsService: TabsService,
        private heartrateService: HeartrateService,
        private cadenceService: CadenceService,
        private textToSpeechService: TextToSpeechService,
        private meteoService: MeteoService) {
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
 
        this.heartrateService.getBpmObservable().subscribe(bpm => this.bpm = bpm != null? formatNumberValue(bpm, '1.0-0'): "-")
        this.cadenceService.getRpmObservable().subscribe(rpm => this.rpm = rpm != null? formatNumberValue(rpm, '1.0-0'): "-")

        this.geolocationService.getLocationObservable().subscribe(location => this._updateLocation(location))
        this.geolocationService.getTimeObservable().subscribe(() => this._updateTime())
        this.geolocationService.getDemObservable().subscribe((demInfo: [number, number]) => this._updateDem(demInfo))
        //this.geolocationService.getStartStopObservable().subscribe((liveStatus: LiveStatus) => this._startStop(liveStatus))
        this.meteoIntervalObservable.subscribe(
            () => {
              this.meteoService.updateMeteo((infoMeteo) => {
                this.infoMeteo = infoMeteo
                this.infoMeteoData = this.meteoService.infoMeteoData
                //trace.write(`live: infoMeteoData ${JSON.stringify(this.infoMeteoData)}`, trace.categories.Debug)
            })
            }
        )
        this.refreshMeteo()
        this.tabsService.getAppStatusObserver().subscribe(async () => {
            if (this.tabsService.isStarted() && await this.geolocationService.existsLiveTrack()) {
                this.showRestoreDialogOpen()
                trace.write(`live: restore live track?`, trace.categories.Debug)
            }
        })
    }

    refreshMeteo() {
        this.meteoService.updateMeteo((infoMeteo) => {
            this.infoMeteo = infoMeteo
            this.infoMeteoData = this.meteoService.infoMeteoData
            //trace.write(`live: infoMeteoData ${JSON.stringify(this.infoMeteoData)}`, trace.categories.Debug)
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

    isStopped() {
        return !this.isStarted() && !this.isPaused()
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
        return this.isStopped() && !this._starting ? 'visible' : 'collapse'
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

    private _updateDem(demInfo: [number, number]) {
        if (this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.TRACK &&
            this.isStarted()) {
            this.dem = formatNumberValue(demInfo[0], '1.0-0')
            this.gradient = formatNumberValue(demInfo[1], '1.1-1')
            trace.write('live._updateDem: dem ' + this.dem + ' gradient ' + this.gradient, trace.categories.Debug)
        }
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