import { ExternalStorageStore } from "./store/external-storage-store";
import * as fs from 'tns-core-modules/file-system';
const trace = require("trace");
import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from '@angular/common/http'
import * as appSettings from 'tns-core-modules/application-settings'
import { AWSDemResponse } from "~/app/models/types"
import { AppSettingsKey, AppSettingsDefaultValue } from "./models/types";

@Injectable({
  providedIn: 'root'
})
export class BackupRestoreService extends ExternalStorageStore{

  private headers: HttpHeaders
  private endpoint: string

  constructor(
    private httpClient: HttpClient) {
      super()
      const endpointPrefix:string =  appSettings.getString(
        AppSettingsKey.AWS_BACKUP_RESTORE_ENDPOINT_PREFIX, 
        AppSettingsDefaultValue.AWS_BACKUP_RESTORE_ENDPOINT_PREFIX
      );
      const apiKey:string = appSettings.getString(
        AppSettingsKey.AWS_BACKUP_RESTORE_API_KEY, 
        AppSettingsDefaultValue.AWS_BACKUP_RESTORE_API_KEY
      );
      const region:string = appSettings.getString(
        AppSettingsKey.AWS_BACKUP_RESTORE_REGION, 
        AppSettingsDefaultValue.AWS_BACKUP_RESTORE_REGION
      );
      this.headers = new HttpHeaders({ 'X-API-Key': apiKey })
      this.endpoint = `https://${endpointPrefix}.execute-api.${region}.amazonaws.com/Prod/`
  }

  async backup(): Promise<void> {
    try {

      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(BackupRestoreService.TRACKS_FOLDER);
      const entities: fs.FileSystemEntity[] = await folder.getEntities()
      const backupEndpoint: string = `${this.endpoint}\backup` 

      let body = []
      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];
        if (entity.name.length == 9) continue;
        body.push({
          name: entity.name,
          content: await folder.getFile(entity.name).readText()
        })
      }
      trace.write(`BackupRestoreService.backup: body ${JSON.stringify(body)}`, trace.categories.Error)
      this.httpClient.post(backupEndpoint, body, { headers: this.headers }).subscribe((data: AWSDemResponse) => {
            trace.write(`BackupRestoreService.backup: response ${data.message}`, trace.categories.Debug)
      }) 
    } catch (err) {
      trace.write(`BackupRestoreService.backup: There was an error o ${err.nessage}`, trace.categories.Error)   
      throw err
     }
  }
  
  async restore(): Promise<void> {
    try {
      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(ExternalStorageStore.TRACKS_FOLDER);
      const restoreEndpoint: string = `${this.endpoint}\restore` 
 
      this.httpClient.get(restoreEndpoint, { headers: this.headers }).subscribe((data: AWSDemResponse) => {
        trace.write(`BackupRestoreService.restore: response ${data.message}`, trace.categories.Debug)
      
        for (let index = 0; index < data.tracks.length; index++) {
          const track = data.tracks[index];
          this.setValue(track.name, JSON.stringify(track.content))
          trace.write(`BackupRestoreService.restore: ${track.name} restored`, trace.categories.Debug)  
        }
      }) 
      
    } catch (err) {
      trace.write(`BackupRestoreService.restore: There was an error o ${err.nessage}`, trace.categories.Error)   
      throw err
    }
  }
}