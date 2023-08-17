import { getPathLength, getDistance } from 'geolib';
import { Track } from "./Track";
import * as moment from 'moment'
import { GeoLocation } from "./GeoLocation";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as appSettings from "tns-core-modules/application-settings";
import { AppSettingsKey, AWSDemResponse, AppSettingsDefaultValue, ClimbDownHillAccumulator} from "~/app/models/types"
import { BehaviorSubject } from 'rxjs';

const timeseries = require("timeseries-analysis");
const trace = require("trace");

export class LiveTrack {
    speed: number = 0;
    distance: number = 0;
    duration: number = 0;
    average: number = 0;

    private startTime: moment.Moment;
    private pausedTime: moment.Moment;
    private pausedDuration: number = 0;
    private demDistance: number = 0;
    private lastDem: number;

    private liveLocations: GeoLocation[];

    private mapboxAccessToken = appSettings.getString(AppSettingsKey.MAPBOX_ACCESS_TOKEN, AppSettingsDefaultValue.MAPBOX_ACCESS_TOKEN)

    constructor(track: Track = null) {
        if (track) {
            this.startTime = moment(track.startTime);
            this.liveLocations = track.locations;
            this.pausedDuration = track.pausedDuration;
            this.distance = getPathLength(this.liveLocations) / 1000
            this.duration = moment().diff(this.startTime) - this.pausedDuration
            if (this.duration > 0) {
                this.average = Math.round(this.distance / this.duration * 3600 * 1000 * 100) / 100;
            }
        }
    }

    getStartTime(): moment.Moment {
        return this.startTime;
    }

    start() {
        this.startTime = moment();
        this.speed = null;
        this.distance = null;
        this.average = null;
        this.lastDem = null;
        this.duration = 0;
        this.pausedDuration = 0;
        this.liveLocations = [];
    }

    pause() {
        this.pausedTime = moment();
    }

    resume() {
        this.pausedDuration += moment().diff(this.pausedTime);
        this.pausedTime = null;
    }

    stop() {
        this.startTime = null;
    }

    isStarted(): boolean {
        return this.startTime != null;
    }

    isPaused(): boolean {
        return this.pausedTime != null;
    }

    updateDuration() {
        if (this.isStarted() && !this.isPaused()) {
            this.duration = moment().diff(this.startTime) - this.pausedDuration;
        }
    }


    addLocation(location: GeoLocation/*, startStopSubject: BehaviorSubject<LiveStatus>*/) {
        this.speed = this.getLastLocationValue('speed') * 3.6;
        const lastLocation: GeoLocation = this.getLastLocation()
        let lastDistance: number = null
        if (lastLocation) {
            lastDistance = getDistance(lastLocation, location)
            this.distance += (lastDistance / 1000)
            this.demDistance += lastDistance

            // if (appSettings.getBoolean(
            //     AppSettingsKey.AUTOMATIC_START_STOP,
            //     JSON.parse(AppSettingsDefaultValue.AUTOMATIC_START_STOP))) {

            // //     // if last location speed is zero, auto pause
            //     if (!this.isPaused() &&
            //         this.speed == 0) {
            //         startStopSubject.next(LiveStatus.PAUSED)
            //         trace.write(`LiveTrack.addLocation(): startStop PAUSED`, trace.categories.Debug)
            //     }

            //     // if last 3 locations speed is more then zero, auto resume
            //     const lastButOneLocation: GeoLocation = this.getLastButOneLocation()
            //     if (this.isPaused() &&
            //         this.speed > 0 &&
            //         lastLocation.speed > 0 &&
            //         lastButOneLocation &&
            //         lastButOneLocation.speed > 0
            //     ) {
            //         //startStopSubject.next(LiveStatus.RESUMED)
            //         trace.write(`LiveTrack.addLocation(): startStop RESUME`, trace.categories.Debug)
            //     }
            // }
        }
        if (this.duration > 0) {
            this.average = this.distance / this.duration * 3600 * 1000;
        }
        if (!this.isPaused() && (!lastDistance || lastDistance > 0)) {
            this.liveLocations.push(location)
        }
    }

    getLiveLocations(): GeoLocation[] {
        return this.liveLocations
    }

    getLastLocation(): GeoLocation {
        return this.liveLocations && this.liveLocations.length > 0 ? this.liveLocations[this.liveLocations.length - 1] : null;
    }

    getLastButOneLocation(): GeoLocation {
        return this.liveLocations && this.liveLocations.length > 1 ? this.liveLocations[this.liveLocations.length - 2] : null;
    }

    _processNewDem(dem: number, lastLocation: GeoLocation, demSubject: BehaviorSubject<[number, number]>) {
        lastLocation.dem = dem
        let gradient = 0
        if (this.demDistance > 0 && this.lastDem) {
            gradient = (dem - this.lastDem) / this.demDistance * 100
        }
        trace.write(`liveTrack.updateDem: dem ${dem}, last dem ${this.lastDem}, dem distance ${this.demDistance}, gradient ${gradient}`, trace.categories.Debug)
        this.lastDem = dem
        this.demDistance = 0
        demSubject.next([dem, gradient])
    }

    _fetchMapboxDem(httpClient: HttpClient, demSubject: BehaviorSubject<[number, number]>, lastLocation: GeoLocation) {
        const url: string = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lastLocation.longitude},${lastLocation.latitude}.json?layers=contour&limit=50&access_token=${this.mapboxAccessToken}`
        httpClient.get(url).subscribe((data) => {
            if (data && data['features']) {
                const dem = Math.max(...data['features'].map(e => e.properties.ele))
                this._processNewDem(dem, lastLocation, demSubject)
            }
        })
    }

    _fetchAWSDem(httpClient: HttpClient, demSubject: BehaviorSubject<[number, number]>, lastLocation: GeoLocation) {

        const httpHeaders = new HttpHeaders({ 'X-API-Key': AppSettingsDefaultValue.DEM_AWS_API_KEY })
        const url: string = `https://snzo48pwgj.execute-api.eu-west-1.amazonaws.com/Prod/${lastLocation.latitude}/${lastLocation.longitude}`

        httpClient.get(url, { headers: httpHeaders }).subscribe((data: AWSDemResponse) => {
            if (data && data.status) {
                this._processNewDem(data.dem, lastLocation, demSubject)
            }
            else if (data && !data.status) {
                trace.write(`liveTrack._fetchAWSDem: error response ${data.message}`, trace.categories.Error)
            }
            //     else {
            //         this._fetchMapboxDem(httpClient, demSubject, lastLocation)
            //     }
        })
    }

    updateDem(httpClient: HttpClient, demSubject: BehaviorSubject<[number, number]>) {
        if (this.isStarted()) {
            const lastLocation = this.getLastLocation()
            if (lastLocation) {
                this._fetchAWSDem(httpClient, demSubject, lastLocation)
            }
            else {
                trace.write('liveTrack.updateDem: none location, none dem', trace.categories.Debug)
            }
        }
    }


    updateBpm(bpm: number) {
        if (this.isStarted()) {
            const lastLocation = this.getLastLocation()
            if (lastLocation && !lastLocation.bpm) {
                lastLocation.bpm = bpm
            }
        }
    }

    updateRpm(rpm: number) {
        if (this.isStarted()) {
            const lastLocation = this.getLastLocation()
            if (lastLocation && !lastLocation.rpm) {
                lastLocation.rpm = rpm
            }
        }
    }

    getTrack(isToStop: boolean = false): Track {
        return {
            key: this.getStartTime().format('YYYYMMDD_HHmmss'),
            startTime: this.getStartTime().format(),
            pausedDuration: this.pausedDuration,
            locations: this.getLiveLocations(),
            stopTime: isToStop ? moment().format() : null
        }
    }

    static computeTrackInfo(track: Track): void {
        track.distance = Math.round(getPathLength(track.locations) / 1000 * 100) / 100
        track.duration = moment(track.stopTime).diff(moment(track.startTime)) - track.pausedDuration

        if (track.duration > 0) {
            track.average = Math.round(track.distance / track.duration * 3600 * 1000 * 100) / 100;
        }
        track.maxBpm = track.locations.filter(loc => loc.bpm).reduce((prev, curr) => {
            return prev > curr.bpm ? prev : curr.bpm;
        },0);
        track.maxSpeed = track.locations.reduce((prev, curr) => {
            return prev > curr.speed ? prev : curr.speed;
        },0) * 3.6;

        const locations = track.locations.filter(location => location.dem)
        const ts = new timeseries.main(timeseries.adapter.fromDB(locations, {
            date: 'timestamp',
            value: 'dem'
        }));
        ts.smoother({ period: 5 })

        track.minAltitude = Math.round(ts.min())
        track.maxAltitude = Math.round(ts.max())

        const accumulator = LiveTrack.updateClimbDownhill(ts.output())

        track.climb = accumulator.climb;
        track.downhill = accumulator.downhill;
    }

    static updateClimbDownhill(demTimeSeries: any[]): ClimbDownHillAccumulator {
        const accumulator: ClimbDownHillAccumulator = { climb: 0, downhill: 0, lastDem: demTimeSeries[0][1] };
        demTimeSeries.reduce((acc, row) => {
            // update climb /down hill when threshold reached
            if (row[1] && Math.abs(acc.lastDem - row[1]) >= 5) {
                LiveTrack._updateClimbDownHill(acc, row[1])
                acc.lastDem = row[1]
            }
            return acc;
        }, accumulator);
        // update climb / down hill with last dem
        LiveTrack._updateClimbDownHill(accumulator, demTimeSeries[demTimeSeries.length - 1][1])
        return accumulator;
    }

    private static _updateClimbDownHill(acc: ClimbDownHillAccumulator, dem: number) {
        const diff = Math.round(dem - acc.lastDem)
        if (diff > 0) {
            acc.climb += diff
        }
        else {
            acc.downhill += Math.abs(diff)
        }
        //console.log(`diff ${diff} climb ${acc.climb} downhill ${acc.downhill} dem ${Math.round(dem)}`)
    }

    getLastLocationValue(key: string) {
        const lastLocation = this.getLastLocation()
        return lastLocation ? lastLocation[key] : null;
    }
}
