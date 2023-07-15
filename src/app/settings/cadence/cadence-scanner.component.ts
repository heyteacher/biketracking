import { Component, OnInit } from "@angular/core";
import { CadenceService } from "~/app/cadence.service";
import { Peripheral } from 'nativescript-bluetooth';
import { RouterExtensions } from "nativescript-angular";

@Component({
    selector: "CadenceScanner",
    templateUrl: "./cadence-scanner.component.html",
    styleUrls: ["./cadence-scanner.component.scss"]

})
export class CadenceScannerComponent implements OnInit {

    peripherals: Peripheral[]

    get scanning(): boolean {
        return this.cadenceService.isScanning()
    }

    constructor(
        private cadenceService: CadenceService,
        private _routerExtensions: RouterExtensions,
    ) { 
    }

    async ngOnInit() {
        this.cadenceService.getPeripheralObservable().subscribe(
            (peripheral: Peripheral) => this._addPeripheral(peripheral)
        )
    } 

    onBackTap() {
        this.stopScanning()
        this._routerExtensions.back()
    }

    startScanning(){
        this.peripherals = null
        this.cadenceService.startScanning()
    }

    stopScanning(){
        this.cadenceService.stopScanning()
    }

    connect(peripheral: Peripheral){
        this.stopScanning()
        this.cadenceService.connect(peripheral)
        this.cadenceService.start()
        this._routerExtensions.back()
    }

    visibleIfStartedScanning() {
        return this.cadenceService.isScanning() ? 'visible' : 'collapse'        
    }

    visibleIfStoppedScanning() {
        return !this.cadenceService.isScanning() ? 'visible' : 'collapse'        
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