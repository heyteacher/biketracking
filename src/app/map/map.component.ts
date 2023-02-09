import { Component, OnInit } from "@angular/core";
import { GeolocationService } from "../geolocation.service";
import { registerElement } from "nativescript-angular/element-registry";
import { Point, Tab, LiveStatus, AppSettingsDefaultValue } from "../models/types";
import { MapboxApi } from "nativescript-mapbox"
registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);
import * as appSettings from "tns-core-modules/application-settings";
import { AppSettingsKey } from "~/app/models/types"
import { TabsService } from "../tabs.service";
import { GeoLocation } from "../models/GeoLocation";
import { HeartrateService } from "../heartrate.service";
import { formatNumberValue, formatTimeValue, formatDurationValue } from "../utils/format";
import * as moment from 'moment'
const trace = require("trace");

@Component({
    selector: "Map",
    templateUrl: "./map.component.html",
    styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit {

    private static readonly  STOPPED_GRIDROWS = "*"
    private static readonly  STARTED_GRIDROWS = "*,80,80"
    distance: string = ""
    speed: string = ""
    dem: string = ""
    bpm: string = ""
    duration: string = ""
    time: string = ""
    
    gridRows = MapComponent.STOPPED_GRIDROWS

    mapboxAccessToken = appSettings.getString(AppSettingsKey.MAPBOX_ACCESS_TOKEN,AppSettingsDefaultValue.MAPBOX_ACCESS_TOKEN)
    mapboxStyle = appSettings.getString(AppSettingsKey.MAPBOX_STYLE,AppSettingsDefaultValue.MAPBOX_STYLE)

    private lastLocation: GeoLocation = null
    private mapbox: MapboxApi

    constructor(
        private geolocationService: GeolocationService,
        private heartrateService: HeartrateService,
        private tabsService: TabsService) {
    }

    ngOnInit() {
        this.heartrateService.getBpmObservable().subscribe(bpm => this._updateBpm(bpm))
        this.geolocationService.getLocationObservable().subscribe(location => this._updateLocation(location))
        this.geolocationService.getTimeObservable().subscribe(() => this._updateTime())
        this.geolocationService.getDemObservable().subscribe(demInfo => this._updateDem(demInfo))
        this.tabsService.getSelectedTabObserver().subscribe(tab => this._updateSelectedTab(tab))
        this.geolocationService.getLiveStatusObservable().subscribe(liveStatus => this._updateLiveStatus(liveStatus))
    }

    visibleIfStarted() {
        return this.gridRows == MapComponent.STARTED_GRIDROWS? 'visible' : 'collapse'
    }
    
    async centerUser() {
        const currentLocation: GeoLocation = await this.geolocationService.getCurrentLocation()
        if (currentLocation != null) {
            this.mapbox.setCenter({
                lat: currentLocation.latitude,
                lng: currentLocation.longitude
            })
        }
    }

    onMapReady($event) {
        trace.write("map.onMapReady", trace.categories.Debug)
        this.tabsService.setAppStatusStart()
        this.mapbox = $event.map
        if (this.tabsService.getSelectedTab() == Tab.MAP) {
            this._start()
        }
    }

    private _updateSelectedTab(tab: Tab) {
        if (tab == Tab.MAP) {
            this._start()
        }
        else if (this.mapbox != null) {
            this._stop()
        }
    }
    
    private _updateLiveStatus(liveStatus: LiveStatus): void {
        if (liveStatus == LiveStatus.STOPPED) {
            this.duration = ""
            this.speed = ""
            this.time = ""
            this.distance = ""
            this.dem = ""
            this.bpm = ""
            this.gridRows = MapComponent.STOPPED_GRIDROWS
        }
        if (liveStatus == LiveStatus.STARTED){
            this._updateTime()
            this.gridRows = MapComponent.STARTED_GRIDROWS
        }
    }
    
    private _stop() {
        this.mapbox.removePolylines()
    }

    private _animateCamera(location: GeoLocation) {
        if (this.mapbox &&
            location &&
            this.tabsService.getSelectedTab() == Tab.MAP &&
            this.tabsService.isAppOpen()
        ) {
            this.mapbox.animateCamera({
                // this is where we animate to
                target: {
                    lat: location.latitude,
                    lng: location.longitude
                },
                //zoomLevel: 17, // Android
                bearing: location.direction, // Where the camera is pointing, 0-360 (degrees)
                tilt: 30,
                duration: 3000 // default 10000 (milliseconds)
            })
        }
    }

    private async _start() {
        // load live location already tracked
        //trace.write("map.start()", trace.categories.Debug)
        const liveLocations: GeoLocation[] = this.geolocationService.getLiveTrack().getLiveLocations()
        if (liveLocations != null && liveLocations.length > 0) {
            const points: Point[] = liveLocations.map((location: GeoLocation): Point => {
                return {
                    lat: location.latitude,
                    lng: location.longitude
                }
            })
            this.mapbox.addPolyline({
                color: '#7bd3ff', // Set the color of the line (default black)
                width: 4, // Set the width of the line (default 5)
                opacity: 0.6, //Transparency / alpha, ranging 0-1. Default fully opaque (1).
                points: points
            })
        }
        this._updateTime()
    }
    private _updateDem(demInfo: [number, number]) {
        if (this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.MAP) {
            this.dem = formatNumberValue(demInfo[0], '1.0-0')
        }
    }

    private _updateBpm(bpm: number) {
        this.bpm = bpm != null? formatNumberValue(bpm, '1.0-0'): "-"
    }

    private _updateLocation(location) {
        if (this.lastLocation != null &&
            this.mapbox &&
            this.tabsService.getSelectedTab() == Tab.MAP &&
            this.tabsService.isAppOpen() &&
            !this.geolocationService.getLiveTrack().isPaused()
        ) {
            trace.write('map.addPolyline and animateCamera', trace.categories.Debug)
            this.mapbox.addPolyline({
                color: '#7bd3ff', // Set the color of the line (default black)
                //width: 7, // Set the width of the line (default 5)
                //opacity: 0.6, //Transparency / alpha, ranging 0-1. Default fully opaque (1).
                points: [
                    {
                        'lat': this.lastLocation.latitude,
                        'lng': this.lastLocation.longitude
                    },
                    {
                        'lat': location.latitude,
                        'lng': location.longitude
                    }
                ]
            })
            this._animateCamera(location)
        }
        this.lastLocation = location

        if (this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.MAP) {
            this.speed = formatNumberValue(this.geolocationService.getLiveTrack().speed)
            this.distance = formatNumberValue(this.geolocationService.getLiveTrack().distance)
        }
    }

    private _updateTime() {
        if (this.tabsService.isAppOpen() &&
            this.tabsService.getSelectedTab() == Tab.MAP) {
            this.time = formatTimeValue(moment())
            this.duration = formatDurationValue(this.geolocationService.getLiveTrack().duration)
        }
    }
}
