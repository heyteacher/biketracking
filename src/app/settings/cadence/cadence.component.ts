import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { registerElement } from "nativescript-angular/element-registry";
import { CadenceService } from "~/app/cadence.service";
import { TabsService } from "~/app/tabs.service";
import { CadenceDeviceStatus } from "~/app/models/types";
import { formatNumberValue } from "~/app/utils/format";
import { localize } from "nativescript-localize/angular";

const mapbox = require("nativescript-mapbox")
registerElement("Mapbox", () => mapbox.MapboxView);

@Component({
    selector: "HeartRate",
    templateUrl: "./cadence.component.html",
    styleUrls: ["./cadence.component.scss"]

})
export class CadenceComponent implements OnInit {

    get peripheral(): string {
        if (this.cadenceService.periphericalUUID) {
            return this.cadenceService.periphericalName? 
                `${this.cadenceService.periphericalUUID} \n ${this.cadenceService.periphericalName}`: 
                this.cadenceService.periphericalUUID
        }
        return localize('No Device Connected')
    }
 
    rpm = "-"
    cadenceCounter = "-"
    status = "-"

    constructor(
        private cadenceService: CadenceService,
        private _routerExtensions: RouterExtensions,
        private tabsService: TabsService,
        //private amzLinksService: AmzLinksService
    ) {}

    async ngOnInit() {
        this.cadenceService.getRpmObservable().subscribe(rpm => this.rpm = rpm != null? formatNumberValue(rpm, '1.0-0'): "-")
        this.cadenceService.getCrankRevolutionsCounterObservable().subscribe(cadenceCounter => this.cadenceCounter = cadenceCounter != null? formatNumberValue(cadenceCounter, '1.0-0'): "-")
        this.cadenceService.getDeviceStatusObservable().subscribe(status => this.status = localize(status))
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

    restart(): void {
        this.cadenceService.restart()
    }
    
    visibleIfConnected() {
        return this.cadenceService.periphericalUUID ? 'visible' : 'collapse'
    }

    visibleIfNotConnected() {
        return !this.cadenceService.periphericalUUID ? 'visible' : 'collapse'
    }
}