import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions, registerElement } from "@nativescript/angular";
import { StoreService } from "../../store.service";

import { Track } from "~/app/models/Track";
import { Tab, AppSettingsDefaultValue } from "~/app/models/types";
import { formatNumberValue, formatDurationValue, formatDateValue, formatTimeValue } from "~/app/utils/format";
import * as appSettings from '@nativescript/core/application-settings';

import { AppSettingsKey } from "~/app/models/types"
import { MapboxApi, SetViewportOptions } from "nativescript-mapbox";
import { getBounds, getDistance } from "geolib";
import { TabsService } from "~/app/tabs.service";
import { ObservableArray } from '@nativescript/core';
import { Series } from "~/app/models/Series";
import { GeoLocation } from "~/app/models/GeoLocation";
import * as moment from 'moment'


import { ExternalStorageStore } from "~/app/store/external-estorage-store";
import { LiveTrack } from "~/app/models/LiveTrack";

const mapbox = require("nativescript-mapbox")
registerElement("Mapbox", () => mapbox.MapboxView);

@Component({
    selector: "TrackDetails",
    templateUrl: "./track-details.component.html",
    styleUrls: ["./track-details.component.scss"]
})
export class TrackDetailsComponent implements OnInit {

    mapboxAccessToken = appSettings.getString(AppSettingsKey.MAPBOX_ACCESS_TOKEN, AppSettingsDefaultValue.MAPBOX_ACCESS_TOKEN)
    mapboxStyle = appSettings.getString(AppSettingsKey.MAPBOX_STYLE, AppSettingsDefaultValue.MAPBOX_STYLE)

    trackTitle: string

    startTime: string;
    stopTime: string;

    distance: string
    duration: string

    average: string
    maxSpeed: string

    climb: string
    downhill: string

    minAltitude: string
    maxAltitude: string

    maxBpm: string

    private trackId: string
    private track: Track
    private mapbox: MapboxApi
    private _bpmDateTimeSource: ObservableArray<Series>
    private _altitudeDistanceSource: ObservableArray<Series>
    
    majorTickInterval: number;

    @ViewChild('map', { static: false }) mapElement: ElementRef;

    constructor(
        private storeService: StoreService,
        private tabsService: TabsService,
        private _route: ActivatedRoute,
        private _routerExtensions: RouterExtensions
    ) { }

    private _buildSeries(categoryField:string, valueField:string, locations): ObservableArray<Series> {
        const timeSeries: Series[] = locations
            .filter((location: GeoLocation): boolean => {
                return location.hasOwnProperty(valueField)
            })
            .map((location: GeoLocation): Series => {
                    return {
                        category: moment(location[categoryField]).valueOf(),
                        value: location[valueField] 
                    }
            })
        return new ObservableArray(timeSeries)
    }

    async ngOnInit() {


        this.trackId = this._route.snapshot.params.id;
        this.track = await this.storeService.getTrack(this.trackId);

        this.majorTickInterval = Math.round(this.track.locations.length / 20)
        this.track.locations.map((location, index) => this._calculateDistance(location, index))
        
        this._bpmDateTimeSource = this._buildSeries('timestamp','bpm', this.track.locations)

        const distanceLocations = this.track.locations.
            map((location) => {
                location.distance = Math.floor(location.distance / 1000)
                return location
            }).
            filter((location, index, array) => {
                if (index > 0) {
                    return location.distance != array[index-1].distance  
                }
                return true
            })
        this._altitudeDistanceSource = this._buildSeries('distance','altitude', distanceLocations)

        LiveTrack.computeTrackInfo(this.track)
        this.storeService.updateTrack(this.track)

        this.trackTitle = formatDateValue(this.track.startTime)

        this.startTime = formatTimeValue(this.track.startTime)
        this.stopTime = formatTimeValue(this.track.stopTime)

        this.distance = formatNumberValue(this.track.distance)
        this.duration = formatDurationValue(this.track.duration)

        this.average = formatNumberValue(this.track.average)
        this.maxSpeed = formatNumberValue(this.track.maxSpeed)

        this.climb = formatNumberValue(this.track.climb, '1.0-0')
        this.downhill = formatNumberValue(this.track.downhill, '1.0-0')

        this.minAltitude = formatNumberValue(this.track.minAltitude, '1.0-0')
        this.maxAltitude = formatNumberValue(this.track.maxAltitude, '1.0-0')

        this.maxBpm = formatNumberValue(this.track.maxBpm, '1.0-0')

        this.tabsService.getSelectedTabObserver().subscribe((tab: Tab) => {
            if (tab != Tab.HISTORY) {
                this.onBackTap()
            }
        })
    }
    _calculateDistance(location: GeoLocation, index: number): any {
        const prevLocation = this.track.locations[index-1]
        const distance = index > 0 ? prevLocation.distance + getDistance(prevLocation,location): 0
        location.distance = distance
    }

    onBackTap(): void {
        this._routerExtensions.back();
    }

    async onMapReady($event) {
        this.mapbox = $event.map;

        // set the viewport map
        const bounds = getBounds(this.track.locations)
        const viewport: SetViewportOptions = {
            bounds: {
                south: bounds.minLat,
                north: bounds.maxLat,
                east: bounds.maxLng,
                west: bounds.minLng
            }
        }
        await this.mapbox.setViewport(viewport)

        // add track
        const points = this.track.locations.map(location => {
            return {
                lat: location.latitude,
                lng: location.longitude
            }
        })
        await this.mapbox.addPolyline({
            color: '#7bd3ff', // Set the color of the line (default black)
            width: 4, // Set the width of the line (default 5)
            opacity: 0.6, //Transparency / alpha, ranging 0-1. Default fully opaque (1).
            points: points
        })
        // setTimeout( _ => this._generatePreview(), 5000)
    }

    // private _generatePreview(){
    //     const imageFilePath = `${ExternalStorageStore.getApplicationPath()}/${this.track.key}.png`
    //     const  mapboxMapInstance = this.mapElement.nativeElement.mapbox._mapboxMapInstance
    //     const bitmap =  mapboxMapInstance.snapshot()
    //     const imageSource = new ImageSource()
    //     imageSource.setNativeSource(bitmap)
    //     imageSource.saveToFile(imageFilePath, 'png')
      
    //     console.log('_generatePreview', imageFilePath)
    //     targetView.android.setDrawingCacheEnabled(true)
    //     const bitmap = android.graphics.Bitmap.createBitmap(targetView.android.getDrawingCache())
    //     targetView.android.setDrawingCacheEnabled(false)
    
    //     const imageSource = new ImageSource()
    //     imageSource.setNativeSource(bitmap)
    //     imageSource.saveToFile(imageFilePath, 'png')
    // }

    get bpmDateTimeSource(): ObservableArray<Series> {
        return this._bpmDateTimeSource;
    }

    get altitudeDistanceSource(): ObservableArray<Series> {
        return this._altitudeDistanceSource;
    }

    get bpmMinimum(): Date {
        return this.track ? moment(this.track.startTime).toDate() : moment().toDate()
    }

    get bpmMaximum(): Date {
        return this.track ? moment(this.track.stopTime).toDate() : moment().toDate()
    }
}
