import { Injectable } from '@angular/core';
import { Bluetooth, Peripheral, Service } from 'nativescript-bluetooth';
import * as permissions from 'nativescript-permissions'
import { BehaviorSubject, Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as appSettings from 'tns-core-modules/application-settings'
import { AppSettingsKey } from './models/types';
import * as moment from 'moment'

const trace = require("trace");

@Injectable({
  providedIn: 'root'
})
export class CadenceService {
  
  private SERVICE_UUID: string = '1816';
  private CHARACTERISTIC_UUID: string = '2a5b';

  private readonly THROTTLE_TIME: number = 5000

  private _bluetooth: Bluetooth = new Bluetooth();
  private _started: boolean = false;
  private _scanning: boolean = false;
  private _rpmSubject = new BehaviorSubject<number>(null)

  private _periphericalSubject = new BehaviorSubject<Peripheral>(null)
  private _scannedPeripherals = {}

  private _cumulative_crank_revolutions: number
  private _crank_revolutions_timestamp: number

  constructor() {
    this.getRpmObservable().subscribe(rpm => trace.write(`rpm ${rpm}`, trace.categories.Debug))
  }

  get periphericalUUID(): string {
    return appSettings.getString(AppSettingsKey.CADENCE_RATE_PERIPHERAL_UUID);
  }

  get periphericalName(): string {
    return appSettings.getString(AppSettingsKey.CADENCE_RATE_PERIPHERAL_NAME);
  }

  getRpmObservable(): Observable<number> {
    return this._rpmSubject.pipe(throttleTime(this.THROTTLE_TIME))
  }

  getPeripheralObservable(): Observable<Peripheral> {
    return this._periphericalSubject.asObservable()
  }

  async start() {
    try {
      if (!this.periphericalUUID || this.isStarted()) {
        return
      }
      await this._checkPermission()
      this._bluetooth = new Bluetooth()
      await this._bluetooth.connect({
        UUID: this.periphericalUUID,
        onConnected: peripheral => {
          this._started = true
          //for (let index = 0; index < peripheral.services.length; index++) {
          //  const service = peripheral.services[index];
          //  trace.write(`CadenceRateService.onConnected(): ${JSON.stringify(service)}`, trace.categories.Debug)            
          //}
          this._bluetooth.startNotifying({
            characteristicUUID: this.CHARACTERISTIC_UUID,
            serviceUUID: this.SERVICE_UUID,
            peripheralUUID: this.periphericalUUID,
            onNotify: (result) => {
              const data = new Uint8Array(result.value);
              //trace.write(`CadenceRateService.onNotify(): data  ${JSON.stringify(data)}`, trace.categories.Debug)            
              const cumulative_crank_revolutions = data[1] >= 0 ? data[1] : 0
              const crank_revolutions_timestamp = moment().unix()


              if (
                this._cumulative_crank_revolutions > 0 &&
                this._crank_revolutions_timestamp > 0 &&
                cumulative_crank_revolutions >= 0 && 
                cumulative_crank_revolutions > this._cumulative_crank_revolutions &&
                crank_revolutions_timestamp > this._crank_revolutions_timestamp + 15 
              ) {
                this._rpmSubject.next(
                    Math.round(
                      (cumulative_crank_revolutions - this._cumulative_crank_revolutions) / 
                      (crank_revolutions_timestamp - this._crank_revolutions_timestamp) 
                      * 60
                    )
                )
              }
              if (!this._crank_revolutions_timestamp || crank_revolutions_timestamp > this._crank_revolutions_timestamp + 15) {
                
                trace.write(`CadenceRateService.onNotify(): cumulative_crank_revolutions  ${cumulative_crank_revolutions} _cumulative_crank_revolutions  ${this._cumulative_crank_revolutions}   crank_revolutions_timestamp  ${crank_revolutions_timestamp} _crank_revolutions_timestamp  ${this._crank_revolutions_timestamp}`, trace.categories.Debug)                            
                
                this._cumulative_crank_revolutions = cumulative_crank_revolutions
                this._crank_revolutions_timestamp = crank_revolutions_timestamp
              }
            }
          })
        },
        onDisconnected: peripheral => { }
      })
      trace.write(`CadenceRateService.start(): connected`, trace.categories.Debug)
    } catch (error) {
      trace.write(`CadenceRateService.start(): error ${error}`, trace.categories.Error)
    }
  }

  async restart() {
    await this.stop()
    this.start()
  }

  async stop() {
    try {
      if (this.periphericalUUID) {
        await this._bluetooth.disconnect({
          UUID: this.periphericalUUID
        })
        trace.write(`CadenceRateService.stop(): disconnected`, trace.categories.Debug)
      }
      this._started = false
    } catch (error) {
      trace.write(`CadenceRateService.stop(): error ${JSON.stringify(error)}`, trace.categories.Error)
    }
  }

  isStarted() {
    return this._started
  }

  isScanning() {
    return this._scanning
  }

  public async startScanning() {
    try {
      if (this._scanning) {
        return
      }
      await this._checkPermission()
      await this.stop()
      this._scanning = true
      this._scannedPeripherals = {}
      this._bluetooth = new Bluetooth()
      await this._bluetooth.startScanning({
        //filters: [{serviceUUID: this.SERVICE_UUID}],
        seconds: 20,
        onDiscovered: (peripheral: Peripheral) => this._addPeripherical(peripheral),
        skipPermissionCheck: true
      })
      this._scanning = false
      trace.write(`CadenceRateService.scartScanning(): finished`, trace.categories.Debug)
    } catch (error) {
      trace.write(`CadenceRateService.startScanning(): error ${error}`, trace.categories.Error)
    }
  }

  _addPeripherical(peripheral: Peripheral): void {
    if (this._scannedPeripherals[peripheral.UUID]) {
      return
    }
    this._scannedPeripherals[peripheral.UUID] = peripheral
    this._periphericalSubject.next(peripheral)
  }

  public async stopScanning() {
    try {
      if (!this._scanning) {
        return
      }
      await this._bluetooth.stopScanning()
      this._scanning = false
      trace.write(`CadenceRateService.stopScanning(): stopped`, trace.categories.Debug)
    } catch (error) {
      trace.write(`CadenceRateService.stopScanning(): error ${error}`, trace.categories.Error)
    }
  }

  connect(peripheral: Peripheral) {
    if (peripheral) {
      appSettings.setString(AppSettingsKey.CADENCE_RATE_PERIPHERAL_UUID, peripheral.UUID)
      appSettings.setString(AppSettingsKey.CADENCE_RATE_PERIPHERAL_NAME, peripheral.name)
    }
  }

  async disconnect() {
    await this.stop()
    appSettings.remove(AppSettingsKey.CADENCE_RATE_PERIPHERAL_UUID)
    appSettings.remove(AppSettingsKey.CADENCE_RATE_PERIPHERAL_NAME)
  }

  private async _checkPermission() {
    const permission = android.Manifest.permission.ACCESS_FINE_LOCATION
    if (!permissions.hasPermission(permission)) {
      const permissionResponse = await permissions.requestPermission(permission);
      trace.write(`ACCESS_FINE_LOCATION permission ok ${permissionResponse}`, trace.categories.Debug)
      const bluetooth = new Bluetooth()
      const granted = await bluetooth.hasLocationPermission()
      if (!granted) {
        await bluetooth.requestCoarseLocationPermission()
      }
    }
  }
}