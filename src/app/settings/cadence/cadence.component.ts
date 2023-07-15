import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { registerElement } from "nativescript-angular/element-registry";
import { CadenceService } from "~/app/cadence.service";
import { TabsService } from "~/app/tabs.service";
import { Tab, AmzLink, CountryAmzLinks } from "~/app/models/types";
import { formatNumberValue } from "~/app/utils/format";
import { localize } from "nativescript-localize/angular";
//import { AmzLinksService } from "~/app/amz-links.service";

const mapbox = require("nativescript-mapbox")
registerElement("Mapbox", () => mapbox.MapboxView);

@Component({
    selector: "HeartRate",
    templateUrl: "./cadence.component.html",
    styleUrls: ["./cadence.component.scss"]

})
export class CadenceComponent implements OnInit {

    //countryAmzLinks: CountryAmzLinks = this.amzLinksService.countryAmzLinks

    get peripheral(): string {
        if (this.cadenceService.periphericalUUID) {
            return this.cadenceService.periphericalName? 
                `${this.cadenceService.periphericalUUID} \n ${this.cadenceService.periphericalName}`: 
                this.cadenceService.periphericalUUID
        }
        return localize('No Device Connected')
    }
 
    rpm = "-"


    constructor(
        private cadenceService: CadenceService,
        private _routerExtensions: RouterExtensions,
        private tabsService: TabsService,
        //private amzLinksService: AmzLinksService
    ) {}

    async ngOnInit() {
        this.cadenceService.getRpmObservable().subscribe(rpm => this.rpm = rpm != null? formatNumberValue(rpm, '1.0-0'): "-")
        // this.tabsService.getSelectedTabObserver().subscribe( (tab) => {
        //     if (tab != Tab.SETTINGS) {
        //         this.heartrateService.stop()
        //     }
        // })   
    } 

    onBackTap(): void {
        this.cadenceService.stop();
        this._routerExtensions.back();
    }

    disconnect(): void {
        this.cadenceService.disconnect()
    }

    startScanning(): void {
        this.cadenceService.startScanning()
    }
    
    visibleIfConnected() {
        return this.cadenceService.periphericalUUID ? 'visible' : 'collapse'        
    }

    visibleIfNotConnected() {
        return !this.cadenceService.periphericalUUID ? 'visible' : 'collapse'        
    }
}