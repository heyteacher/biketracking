import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { registerElement } from "nativescript-angular/element-registry";
import { HeartrateService } from "~/app/heartrate.service";
import { TabsService } from "~/app/tabs.service";
import { Tab, AmzLink, CountryAmzLinks } from "~/app/models/types";
import { formatNumberValue } from "~/app/utils/format";
import { localize } from "nativescript-localize/angular";
//import { AmzLinksService } from "~/app/amz-links.service";

const mapbox = require("nativescript-mapbox")
registerElement("Mapbox", () => mapbox.MapboxView);

@Component({
    selector: "HeartRate",
    templateUrl: "./heart-rate.component.html",
    styleUrls: ["./heart-rate.component.scss"]

})
export class HeartRateComponent implements OnInit {

    //countryAmzLinks: CountryAmzLinks = this.amzLinksService.countryAmzLinks

    get peripheral(): string {
        if (this.heartrateService.periphericalUUID) {
            return this.heartrateService.periphericalName? 
                `${this.heartrateService.periphericalUUID} \n ${this.heartrateService.periphericalName}`: 
                this.heartrateService.periphericalUUID
        }
        return localize('No Device Connected')
    }
 
    bpm = "-"


    constructor(
        private heartrateService: HeartrateService,
        private _routerExtensions: RouterExtensions,
        private tabsService: TabsService,
        //private amzLinksService: AmzLinksService
    ) {}

    async ngOnInit() {
        this.heartrateService.getBpmObservable().subscribe(bpm => this.bpm = bpm != null? formatNumberValue(bpm, '1.0-0'): "-")
        // this.tabsService.getSelectedTabObserver().subscribe( (tab) => {
        //     if (tab != Tab.SETTINGS) {
        //         this.heartrateService.stop()
        //     }
        // })   
    } 

    onBackTap(): void {
        this.heartrateService.stop();
        this._routerExtensions.back();
    }

    disconnect(): void {
        this.heartrateService.disconnect()
    }

    startScanning(): void {
        this.heartrateService.startScanning()
    }
    
    visibleIfConnected() {
        return this.heartrateService.periphericalUUID ? 'visible' : 'collapse'        
    }

    visibleIfNotConnected() {
        return !this.heartrateService.periphericalUUID ? 'visible' : 'collapse'        
    }

}