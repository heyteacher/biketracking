import { Injectable } from '@angular/core';
import { Track } from './models/Track';
import { BaseTrack } from "./models/BaseTrack";
import { LiveTrack } from "./models/LiveTrack";
import { BehaviorSubject, Observable } from 'rxjs';
import { ExternalStorageStore } from './store/external-storage-store'
import * as moment from 'moment'
const trace = require("trace");

declare var android: any

@Injectable({
  providedIn: 'root'
})
export class StoreService extends ExternalStorageStore {

  private static readonly PENDING_TRACK: string = 'pending_track'

  private tracksSubject = new BehaviorSubject<BaseTrack[]>(null)

  async addTrack(track: Track): Promise<boolean> {
    const year = this._getYear(track.key)
    await this.setValue<Track>(track.key, track)
    const tracks: BaseTrack[] = await this.getTracks(year)
    tracks.unshift({
      key: track.key,
      startTime: track.startTime,
      distance: track.distance,
      duration: track.duration,
      average: track.average
    })
    return this.setValue<BaseTrack[]>(year, tracks, this.tracksSubject)
  }

  async updateTrack(track: Track): Promise<boolean> {
    const year = this._getYear(track.key)
    await this.setValue<Track>(track.key, track)
    const tracks: BaseTrack[] = await this.getTracks(year)
    var index = tracks.findIndex(item => item.key == track.key)
    if (index >= 0) {
      tracks[index].startTime = track.startTime
      tracks[index].distance = track.distance
      tracks[index].duration = track.duration
      tracks[index].average = track.average
    }
    return this.setValue<BaseTrack[]>(year, tracks, this.tracksSubject)
  }

  async removeTracks(keys: string[]): Promise<void> {
    for (const i in keys) {
      const key = keys[i]
      const year = this._getYear(key)
      const tracks: BaseTrack[] = await this.getTracks(year)
      const idx = tracks.findIndex(elem => elem.key == key)
      if (idx >= 0) {
        tracks.splice(idx, 1)
        await this.unsetValue<Track>(key)
        await this.setValue<BaseTrack[]>(year, tracks, this.tracksSubject)
      }
    }
  }

  async getTrack(key: string): Promise<Track> {
    return this.getValue<Track>(key)
  }

  async getTracks(year: string): Promise<BaseTrack[]> {
    return this.getValue<BaseTrack[]>(year, [])
  }

  getTracksObservable(): Observable<BaseTrack[]> {
    return this.tracksSubject.asObservable();
  }

  updateLiveTrack(track: Track): void {
    trace.write('store.updateLiveTrack', trace.categories.Debug)
    this.setValue<Track>(StoreService.PENDING_TRACK, track)
  }

  removeLiveTrack(): void {
    trace.write('store.removeLiveTrack: try...', trace.categories.Debug)
    this.unsetValue<Track>(StoreService.PENDING_TRACK)
    trace.write('store.removeLiveTrack: ...done', trace.categories.Debug)
  }

  async getLiveTrack(): Promise<LiveTrack> {
    return new LiveTrack(await this.getValue<Track>(StoreService.PENDING_TRACK))
  }

  existsLiveTrack(): Promise<boolean> {
    return this.existsValue(StoreService.PENDING_TRACK)
  }

  private _getYear(key: string): string {
    return moment(key,'YYYYMMDD_HHmmss').format('YYYY')
  }
}