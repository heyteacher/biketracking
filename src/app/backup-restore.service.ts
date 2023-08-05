import * as fs from 'tns-core-modules/file-system';
const trace = require("trace");
import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from '@angular/common/http'
import * as appSettings from 'tns-core-modules/application-settings'
import { AppSettingsKey, AppSettingsDefaultValue, AWSListResponse } from "./models/types";
import { StoreService } from './store.service'
import { forkJoin} from 'rxjs';
import * as moment from 'moment'

@Injectable({
  providedIn: 'root'
})
export class BackupRestoreService{

  private endpoint: string
  private apiKey: string

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
  }

  async backup(callback): Promise<void> {
    try {

      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(StoreService.TRACKS_FOLDER);
      const entities: fs.FileSystemEntity[] = await folder.getEntities()
      const backupEndpoint: string = `${this.endpoint}backup` 

      const observables: any[] = [] 
      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];
        trace.write(`BackupRestoreService.backup: track ${entity.name}`, trace.categories.Error)
        if (entity.name.length != 20) continue;
        const body = {
          name: entity.name,
          content: await folder.getFile(entity.name).readText()
        }
        observables.push(this.httpClient.post(backupEndpoint, [body], { headers: new HttpHeaders({ 'X-API-Key': this.apiKey }) }))
      }

      if (observables.length == 0)   {
        callback(`no tracks backuped`)
        return
      }

      forkJoin(observables).subscribe({
        next: async data => {
          callback(`${data.length} tracks backuped`)
        },
        complete: () => {
          trace.write(`BackupRestoreService.backup: backups queued`, trace.categories.Debug)
        },
      })

    } catch (err) {
      trace.write(`BackupRestoreService.backup: There was an error o ${err.nessage}`, trace.categories.Error)   
      callback(`error on tracks backup:${err.nessage}`)
      throw err
     }
  }
  
  async restore(callback): Promise<void> {
    try {
      const listEndpoint: string = `${this.endpoint}list` 
      const restoreEndpoint: string = `${this.endpoint}restore` 
 
      this.httpClient.get(listEndpoint, { headers: new HttpHeaders({ 'X-API-Key': this.apiKey }) }).subscribe((data: AWSListResponse) => {
        trace.write(`BackupRestoreService.restore: list response ${data.tracks.length} tracks`, trace.categories.Debug)
 
        const observables: any[] = [] 
        for (let index = 0; index < data.tracks.length; index++) {
          const key = data.tracks[index].key;
          trace.write(`BackupRestoreService.restore: track ${key}`, trace.categories.Debug)
          observables.push(this.httpClient.get(`${restoreEndpoint}?key=${key}`, { headers: new HttpHeaders({ 'X-API-Key': this.apiKey }) }))        
        }
        
        if (observables.length == 0)   {
          callback(`no tracks restored`)
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
              callback(`${data.length} tracks restored`)
            },
            complete: () => {
              trace.write(`BackupRestoreService.restore: restores queued`, trace.categories.Debug)
            },
        })
      })
    } catch (err) {
      trace.write(`BackupRestoreService.restore: There was an error o ${err.nessage}`, trace.categories.Error)   
      callback(`errore on tracks restore:${err.nessage}`)
      throw err
    }
  }
}