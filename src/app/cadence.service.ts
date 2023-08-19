import { Injectable } from '@angular/core';
import { Bluetooth, Peripheral } from 'nativescript-bluetooth';
import * as permissions from 'nativescript-permissions'
import { BehaviorSubject, Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as appSettings from 'tns-core-modules/application-settings'
import { AppSettingsKey, CrankRevolutions, CadenceDeviceStatus } from './models/types';
import * as moment from 'moment'
const trace = require("trace");

@Injectable({
  providedIn: 'root'
})
export class CadenceService {

  // crank revolutions upper limit before reset 
  private static readonly _CRANK_REVOLUTIONS_BUFFER: number = 256;

  // bluetooth cadence service and characteristic constants
  private static  readonly _SERVICE_UUID: string = '1816';
  private static  readonly _CHARACTERISTIC_UUID: string = '2a5b';

  // skip data received within 10 seconds
  private static  readonly _THROTTLE_TIME_MS: number = 10000

  private _bluetooth: Bluetooth = new Bluetooth();
  private _started: boolean = false;
  private _scanning: boolean = false;

  private _rpmSubject = new BehaviorSubject<number>(null)
  private _crankRevolutionsCounterSubject = new BehaviorSubject<number>(null)
  private _deviceStatusSubject = new BehaviorSubject<CadenceDeviceStatus>(null)

  private _periphericalSubject = new BehaviorSubject<Peripheral>(null)
  private _scannedPeripherals = {}

  private _crank_revolutions: CrankRevolutions[] = []
  private _last_crank_revolutions_counter: number = 0
  private _crank_revolutions_cycles: number = 0

  constructor() {
    this.getRpmObservable().subscribe(rpm => trace.write(
      `CadenceService: rpm ${rpm}`, 
      trace.categories.Debug
    ))
    this.getCrankRevolutionsCounterObservable().subscribe(counter => trace.write(
      `CadenceService: crank revolutions counter: ${counter}`, 
      trace.categories.Debug
    ))
    this.getDeviceStatusObservable().subscribe(status => trace.write(
      `CadenceService: cadence device status: ${status}`, 
      trace.categories.Debug
    ))
  }

  get periphericalUUID(): string {
    return appSettings.getString(AppSettingsKey.CADENCE_RATE_PERIPHERAL_UUID);
  }

  get periphericalName(): string {
    return appSettings.getString(AppSettingsKey.CADENCE_RATE_PERIPHERAL_NAME);
  }

  getRpmObservable(): Observable<number> {
    //return this._rpmSubject.pipe(throttleTime(CadenceService._THROTTLE_TIME_MS))
    return this._rpmSubject.asObservable()
  }

  getCrankRevolutionsCounterObservable(): Observable<number> {
    //return this._crankRevolutionsCounterSubject.pipe(throttleTime(CadenceService._THROTTLE_TIME_MS))
    return this._crankRevolutionsCounterSubject.asObservable()
  }

  getDeviceStatusObservable(): Observable<CadenceDeviceStatus> {
    return this._deviceStatusSubject.asObservable()
  }

  getPeripheralObservable(): Observable<Peripheral> {
    return this._periphericalSubject.asObservable()
  }

  private _reset() {
    this._started = false
    this._crank_revolutions_cycles = 0
    this._last_crank_revolutions_counter = 0
    this._crank_revolutions= []
  }

  async stop() {
    try {
      this._reset()
      if (this.periphericalUUID) {
        await this._bluetooth.disconnect({
          UUID: this.periphericalUUID
        })
        trace.write(`CadenceService.stop(): disconnected`, trace.categories.Debug)
        this._deviceStatusSubject.next(CadenceDeviceStatus.DISCONNECTED)
      }
    } catch (error) {
      trace.write(`CadenceService.stop(): error ${JSON.stringify(error)}`, trace.categories.Error)
      this._deviceStatusSubject.next(CadenceDeviceStatus.ERROR)
    }
  }

  async start() {
    try {
      this._reset()
      if (!this.periphericalUUID || this.isStarted()) {
        return
      }
      await this._checkPermission()
      this._bluetooth = new Bluetooth()
      await this._bluetooth.connect({
        UUID: this.periphericalUUID,
        onConnected: peripheral => {
          this._started = true
          this._deviceStatusSubject.next(CadenceDeviceStatus.CONNECTED);
          this._bluetooth.startNotifying({
            characteristicUUID: CadenceService._CHARACTERISTIC_UUID,
            serviceUUID: CadenceService._SERVICE_UUID,
            peripheralUUID: this.periphericalUUID,
            onNotify: result => {
              this._deviceStatusSubject.next(CadenceDeviceStatus.NOTIFYING)

              const data = new Uint8Array(result.value);
              //trace.write(`CadenceRateService.onNotify(): data  ${JSON.stringify(data)}`, trace.categories.Debug)
              let crank_revolutions_counter = data[1] >= 0 ? data[1] : 0
              crank_revolutions_counter = crank_revolutions_counter + (this._crank_revolutions_cycles * CadenceService._CRANK_REVOLUTIONS_BUFFER)
              const crank_revolutions_timestamp = moment()
          
              //trace.write(`CadenceRateService.onNotify(): crank_revolutions_counter ${crank_revolutions_counter} _last_crank_revolutions_counter ${this._last_crank_revolutions_counter}`, trace.categories.Debug)
              
              // there is a cycle reset 
              if (this._last_crank_revolutions_counter >  crank_revolutions_counter) {
                this._crank_revolutions_cycles = this._crank_revolutions_cycles + 1 
                crank_revolutions_counter = crank_revolutions_counter + CadenceService._CRANK_REVOLUTIONS_BUFFER
                trace.write(`CadenceRateService.onNotify(): new cycle ${this._crank_revolutions_cycles} crank_revolutions_counter  ${crank_revolutions_counter}`, trace.categories.Debug)
              }
              
              // publish the total counter
              this._crankRevolutionsCounterSubject.next(crank_revolutions_counter)
          
              this._crank_revolutions.push({
                timestamp: crank_revolutions_timestamp,
                counter: crank_revolutions_counter
              })
          
              // keep only last minute record
              this._crank_revolutions = this._crank_revolutions.filter(
                (crank_revolutions) => {
                  return moment(crank_revolutions.timestamp).isAfter(moment().subtract(1,'minutes'))
                } 
              )

              // calculate RPM 
              if (this._crank_revolutions.length > 1) {
                const first = this._crank_revolutions[0]
                const last = this._crank_revolutions[this._crank_revolutions.length -1]
                trace.write(`CadenceRateService.onNotify(): _crank_revolutions first ${JSON.stringify(first)} last ${JSON.stringify(last)}`, trace.categories.Debug)
                const rpm = Math.round(
                  (last.counter - first.counter) / 
                  last.timestamp.diff(first.timestamp,'seconds') 
                  * 60
                )
                trace.write(`CadenceService.onNotify(): rpm ${rpm}  seconds ${last.timestamp.diff(first.timestamp,'seconds')}`, trace.categories.Debug)
                this._rpmSubject.next(rpm)
              }
              else {
                trace.write(`CadenceService.onNotify(): rpm not calculated and notified. this._crank_revolutions.length: ${this._crank_revolutions.length}`, trace.categories.Debug)
              }
          
              trace.write(`CadenceService.onNotify(): crank_revolutions_counter ${crank_revolutions_counter} _last_crank_revolutions_counter  ${this._last_crank_revolutions_counter}   crank_revolutions_timestamp  ${crank_revolutions_timestamp}`, trace.categories.Debug)
          
              this._last_crank_revolutions_counter = crank_revolutions_counter          
            }
          })
        },
        onDisconnected: peripheral => this._deviceStatusSubject.next(CadenceDeviceStatus.DISCONNECTED)
      })
    } catch (error) {
      trace.write(`CadenceService.start(): error ${error}`, trace.categories.Error)
      this._deviceStatusSubject.next(CadenceDeviceStatus.ERROR)
    }
  }

  async restart() {
    await this.stop()
    this.start()
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
        seconds: 20,
        onDiscovered: (peripheral: Peripheral) => this._addPeripherical(peripheral),
        skipPermissionCheck: true
      })
      this._scanning = false
      trace.write(`CadenceService.scartScanning(): finished`, trace.categories.Debug)
    } catch (error) {
      trace.write(`CadenceService.startScanning(): error ${error}`, trace.categories.Error)
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
      trace.write(`CadenceService.stopScanning(): stopped`, trace.categories.Debug)
    } catch (error) {
      trace.write(`CadenceService.stopScanning(): error ${error}`, trace.categories.Error)
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
