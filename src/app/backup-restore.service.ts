import { ExternalStorageStore } from "./store/external-storage-store";
import * as fs from 'tns-core-modules/file-system';
const trace = require("trace");
import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from '@angular/common/http'

import { AWSDemResponse } from "~/app/models/types"

@Injectable({
  providedIn: 'root'
})
export class BackupRestoreService extends ExternalStorageStore{

  constructor(
    private httpClient: HttpClient) {
      super()
  }

  async backup(): Promise<void> {
    try {
      const httpHeaders = new HttpHeaders({ 'X-API-Key': 'aGoDQ6OFsZ9bBdDzkUWcSaB1cDN6nFwF36DxDCIs' })
      const url: string = `https://zf9khqu3y9.execute-api.eu-west-1.amazonaws.com/Prod/backup`

      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(BackupRestoreService.TRACKS_FOLDER);
      const entities: fs.FileSystemEntity[] = await folder.getEntities()

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
      this.httpClient.post(url, body, { headers: httpHeaders }).subscribe((data: AWSDemResponse) => {
            trace.write(`BackupRestoreService.backup: response ${data.message}`, trace.categories.Error)
      }) 
    } catch (err) {
      trace.write(`S3Store.backup(): There was an error o ${err.nessage}`, trace.categories.Debug)   
      throw err
     }
  }
  
  async restore(): Promise<void> {
    try {
/*      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(ExternalStorageStore.TRACKS_FOLDER);
      
      const bucket = new S3({
        accessKeyId: appSettings.getString(AppSettingsKey.AWS_ACCESS_KEY_ID),
        secretAccessKey: appSettings.getString(AppSettingsKey.AWS_SECRET_ACCESS_KEY),
        region: appSettings.getString(AppSettingsKey.AWS_REGION)
      });
      
      const listObjectsResp = await bucket.listObjects({Bucket: appSettings.getString(AppSettingsKey.AWS_BUCKET_NAME)}).promise()
      
      for (let index = 0; index < listObjectsResp.Contents.length; index++) {
        const content:S3.Object = listObjectsResp.Contents[index];
        const getObjectsResp = await bucket.getObject({Bucket: appSettings.getString(AppSettingsKey.AWS_BUCKET_NAME), Key: content.Key}).promise()
        this.setValue(content.Key, getObjectsResp.Body)
        trace.write(`S3Store.restore(): ${content.Key} downloaded`, trace.categories.Debug)  
      }
  */
    } catch (err) {
      console.log('There was an error restoring tracks: ', err)
      throw err
    }
  }
}