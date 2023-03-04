import { Component, OnInit } from "@angular/core";
import { HeartrateService } from "~/app/heartrate.service";
import { Peripheral } from 'nativescript-bluetooth';
import { RouterExtensions } from "@nativescript/angular";

@Component({
    selector: "HeartRateScanner",
    templateUrl: "./heart-rate-scanner.component.html",
    styleUrls: ["./heart-rate-scanner.component.scss"]

})
export class HeartRateScannerComponent implements OnInit {

    peripherals: Peripheral[]

    get scanning(): boolean {
        return this.heartrateService.isScanning()
    }

    constructor(
        private heartrateService: HeartrateService,
        private _routerExtensions: RouterExtensions,
    ) { 
    }

    async ngOnInit() {
        this.heartrateService.getPeripheralObservable().subscribe(
            (peripheral: Peripheral) => this._addPeripheral(peripheral)
        )
    } 

    onBackTap() {
        this.stopScanning()
        this._routerExtensions.back()
    }

    startScanning(){
        this.peripherals = null
        this.heartrateService.startScanning()
    }

    stopScanning(){
        this.heartrateService.stopScanning()
    }

    connect(peripheral: Peripheral){
        this.stopScanning()
        this.heartrateService.connect(peripheral)
        this.heartrateService.start()
        this._routerExtensions.back()
    }

    visibleIfStartedScanning() {
        return this.heartrateService.isScanning() ? 'visible' : 'collapse'        
    }

    visibleIfStoppedScanning() {
        return !this.heartrateService.isScanning() ? 'visible' : 'collapse'        
    }

    getPeripheralLabel(peripheral: Peripheral) {
        if (peripheral) {
            return peripheral.name? `${peripheral.UUID} - ${peripheral.name}`: peripheral.UUID
        }
        else  {
            return ''
        }
    }

    private _addPeripheral(peripheral: Peripheral): void {
        if (!this.peripherals) {
            this.peripherals = []
        }
        this.peripherals.push(peripheral)
        this.peripherals.sort((p1:Peripheral, p2:Peripheral) => {
            return p1 && p1.name && p2 && p2.name? 
                    p2.name.length - p1.name.length: 
                    p1 && p1.name? 
                        -1: 
                        p2 && p2.name? 
                            1: 
                            0  
        })
    }
}