import * as fs from 'tns-core-modules/file-system';
const trace = require("trace");
import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from '@angular/common/http'
import * as appSettings from 'tns-core-modules/application-settings'
import { AppSettingsKey, AppSettingsDefaultValue, AWSListResponse } from "./models/types";
import { StoreService } from './store.service'
import { forkJoin} from 'rxjs';
import * as moment from 'moment'
import { localize } from 'nativescript-localize/angular';

@Injectable({
  providedIn: 'root'
})
export class BackupRestoreService{

  private apiKey: string
  private endpoint: string
  private listEndpoint: string
  private backupEndpoint: string
  private restoreEndpoint: string

  constructor(
    private httpClient: HttpClient,
    private storeService: StoreService) {
      const endpointPrefix:string =  appSettings.getString(
        AppSettingsKey.AWS_BACKUP_RESTORE_ENDPOINT_PREFIX, 
        AppSettingsDefaultValue.AWS_BACKUP_RESTORE_ENDPOINT_PREFIX
      );
      this.apiKey = appSettings.getString(
        AppSettingsKey.AWS_BACKUP_RESTORE_API_KEY, 
        AppSettingsDefaultValue.AWS_BACKUP_RESTORE_API_KEY
      );
      const region:string = appSettings.getString(
        AppSettingsKey.AWS_BACKUP_RESTORE_REGION, 
        AppSettingsDefaultValue.AWS_BACKUP_RESTORE_REGION
      );
      this.endpoint = `https://${endpointPrefix}.execute-api.${region}.amazonaws.com/Prod/`
      this.listEndpoint = `${this.endpoint}list` 
      this.backupEndpoint = `${this.endpoint}backup`
      this.restoreEndpoint = `${this.endpoint}restore`
  }

  private async _backupTracks(remoteTracks, callback) {
    const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
    const folder: fs.Folder = <fs.Folder>documents.getFolder(StoreService.TRACKS_FOLDER);
    const entities: fs.FileSystemEntity[] = await folder.getEntities()
    const observables: any[] = []
    let skipped: number = 0 
  
    // load track locally stored
    for (let index = 0; index < entities.length; index++) {
      const entity = entities[index];

      const key = entity.name.split('.')[0]
      
      if (remoteTracks[key]) {
        trace.write(`BackupRestoreService._backupTracks: track ${entity.name} already backuped`, trace.categories.Debug)
        skipped = skipped + 1
        continue
      }
  
      trace.write(`BackupRestoreService._backupTracks: track ${entity.name} to be backuped`, trace.categories.Debug)
      if (entity.name.length != 20) continue;
      const body = {
        name: entity.name,
        content: await folder.getFile(entity.name).readText()
      }
      observables.push(this.httpClient.post(
        this.backupEndpoint, 
        [body], 
        { headers: new HttpHeaders({ 'X-API-Key': this.apiKey })
      }))
    }

    // load today logs
    const todayLogsBody = await this.storeService.getTodayLogsBody()
    if (todayLogsBody != null) {
      trace.write(`BackupRestoreService._backupTracks: found today logs ${todayLogsBody.name}`, trace.categories.Debug)
      observables.push(this.httpClient.post(
        this.backupEndpoint, 
        [todayLogsBody], 
        { headers: new HttpHeaders({ 'X-API-Key': this.apiKey })
      }))
    }
    else {
      trace.write(`BackupRestoreService._backupTracks: today logs NOT found`, trace.categories.Debug)
    }
    if (observables.length == 0)   {
      callback(localize(`no tracks backuped`))
      return
    }
    forkJoin(observables).subscribe({
      next: async data => {
        callback(localize('%s tracks backuped, %s skipped',`${data.length}`,`${skipped}`))
      },
      complete: () => {
        trace.write(`BackupRestoreService.backup: backups queued`, trace.categories.Debug)
      },
    })
  }

  async backup(callback): Promise<void> {
    try {
      const remoteTracks = {}
      this.httpClient.get(this.listEndpoint, { headers: new HttpHeaders({ 'X-API-Key': this.apiKey }) }).subscribe((data: AWSListResponse) => {
        trace.write(`BackupRestoreService.backup: list response ${data.tracks.length} tracks`, trace.categories.Debug)
        for (let index = 0; index < data.tracks.length; index++) {
          const key = data.tracks[index].key.split('/')[1].split('.')[0];
          remoteTracks[key] = key
        } 
        this._backupTracks(remoteTracks, callback)
      })
    } catch (err) {
      trace.write(`BackupRestoreService.backup: error on list remote tracks ${err.nessage}`, trace.categories.Error)   
      callback(localize('error on tracks backup: %s',err.message))
      throw err
     }
  }
  
  async restore(callback): Promise<void> {
    try {
      this.httpClient.get(this.listEndpoint, { headers: new HttpHeaders({ 'X-API-Key': this.apiKey }) }).subscribe((data: AWSListResponse) => {
        trace.write(`BackupRestoreService.restore: list response ${data.tracks.length} tracks`, trace.categories.Debug)
 
        const observables: any[] = [] 
        for (let index = 0; index < data.tracks.length; index++) {
          let key:string = data.tracks[index].key;
          //key = key.replace('tracks/','').replace('.json','')
          //if (this.storeService.getTrack(key) == null) {
            trace.write(`BackupRestoreService.restore: track ${key} to restore`, trace.categories.Debug)
            observables.push(
              this.httpClient.get(`${this.restoreEndpoint}?key=${key}`, 
              { headers: new HttpHeaders({ 'X-API-Key': this.apiKey }) }
            ))
          //} 
          //else {
          //  trace.write(`BackupRestoreService.restore: track ${key} already restored`, trace.categories.Debug)
          //}
        }
        if (observables.length == 0)   {
          callback(localize(`no tracks restored`))
          return
        }
        forkJoin(observables).subscribe({
            next: async data => {
              for (let index = 0; index < data.length; index++) {
                if (data[index]['status']) {
                  const track = data[index]['track']
                  trace.write(`BackupRestoreService.restore: restore  ${track['name']}`, trace.categories.Debug)
                  const trackObj = JSON.parse(track['content'])
                  if (trackObj['key'].indexOf(':') >= 0) {
                    trackObj['key'] =  moment(trackObj['key']).format('YYYYMMDD_HHmmss')
                  } 
                  await this.storeService.addTrack(trackObj)
                }
              }
              callback(localize('%s tracks restored',`${data.length}`))
            },
            complete: () => {
              trace.write(`BackupRestoreService.restore: restores queued`, trace.categories.Debug)
            },
        })
      })
    } catch (err) {
      trace.write(`BackupRestoreService.restore: There was an error o ${err.nessage}`, trace.categories.Error)   
      callback(localize('error on tracks restore: %s',err.message))
      throw err
    }
  }
}