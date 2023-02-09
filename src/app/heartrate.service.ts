import { Injectable } from '@angular/core';
import { Bluetooth, Peripheral, Service } from 'nativescript-bluetooth';
import * as permissions from 'nativescript-permissions'
import { BehaviorSubject, Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as appSettings from 'tns-core-modules/application-settings'
import { AppSettingsKey } from './models/types';

const trace = require("trace");

@Injectable({
  providedIn: 'root'
})
export class HeartrateService {
  
  private SERVICE_UUID: string = '180d';
  private CHARACTERISTIC_UUID: string = '2a37';

  private readonly THROTTLE_TIME: number = 5000

  private _bluetooth: Bluetooth = new Bluetooth();
  private _started: boolean = false;
  private _scanning: boolean = false;
  private _bpmSubject = new BehaviorSubject<number>(null)

  private _periphericalSubject = new BehaviorSubject<Peripheral>(null)
  private _scannedPeripherals = {}

  constructor() {
    //this.getBpmObservable().subscribe(bpm => trace.write(`bpm ${bpm}`, trace.categories.Debug))
  }

  get periphericalUUID(): string {
    return appSettings.getString(AppSettingsKey.HEART_RATE_PERIPHERAL_UUID);
  }

  get periphericalName(): string {
    return appSettings.getString(AppSettingsKey.HEART_RATE_PERIPHERAL_NAME);
  }

  getBpmObservable(): Observable<number> {
    return this._bpmSubject.pipe(throttleTime(this.THROTTLE_TIME))
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
          this._bluetooth.startNotifying({
            characteristicUUID: this.CHARACTERISTIC_UUID,
            serviceUUID: this.SERVICE_UUID,
            peripheralUUID: this.periphericalUUID,
            onNotify: (result) => {
              const data = new Uint8Array(result.value);
              const bpm = data[1] > 0 ? data[1] : null
              this._bpmSubject.next(bpm)
            }
          })
        },
        onDisconnected: peripheral => { }
      })
      trace.write(`HeartRateService.start(): connected`, trace.categories.Debug)
    } catch (error) {
      trace.write(`HeartRateService.start(): error ${error}`, trace.categories.Error)
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
        trace.write(`HeartRateService.stop(): disconnected`, trace.categories.Debug)
      }
      this._started = false
    } catch (error) {
      trace.write(`HeartRateService.stop(): error ${JSON.stringify(error)}`, trace.categories.Error)
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
      trace.write(`HeartRateService.scartScanning(): finished`, trace.categories.Debug)
    } catch (error) {
      trace.write(`HeartRateService.startScanning(): error ${error}`, trace.categories.Error)
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
      trace.write(`HeartRateService.stopScanning(): stopped`, trace.categories.Debug)
    } catch (error) {
      trace.write(`HeartRateService.stopScanning(): error ${error}`, trace.categories.Error)
    }
  }

  connect(peripheral: Peripheral) {
    if (peripheral) {
      appSettings.setString(AppSettingsKey.HEART_RATE_PERIPHERAL_UUID, peripheral.UUID)
      appSettings.setString(AppSettingsKey.HEART_RATE_PERIPHERAL_NAME, peripheral.name)
    }
  }

  async disconnect() {
    await this.stop()
    appSettings.remove(AppSettingsKey.HEART_RATE_PERIPHERAL_UUID)
    appSettings.remove(AppSettingsKey.HEART_RATE_PERIPHERAL_NAME)
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