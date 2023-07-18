import { BehaviorSubject } from "rxjs";
import { ExternalStorageStore } from "./external-storage-store";
import * as fs from 'tns-core-modules/file-system';
import * as moment from 'moment'
const trace = require("trace");
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
i

export class S3Store extends ExternalStorageStore{

  protected static readonly AWS-ACCESS-KEY-ID: string = ''
  protected static readonly AWS-SECRET-ACCESS-KEY: string = ''
  protected static readonly AWS-REGION: string = 'eu-west-1'
  protected static readonly AWS-BUCKET-NAME: string = 'biketracking-tracks'
  
  private async uploadFile<Type>(key: string, value: Type, subject: BehaviorSubject<Type> = null): Promise<boolean> {
    try {
      const bucket = new S3({
        accessKeyId: S3Store.AWS-ACCESS-KEY-ID,
        secretAccessKey: S3Store.AWS-SECRET-ACCESS-KEY,
        region: S3Store.AWS-REGION
      });
      const params = {
            Bucket: S3Store.AWS-BUCKET-NAME,
            Key: `${key}.json`,
            Body: value,
            ContentType: 'application/json'
      };
      const data = await bucket.upload(params).promise()
      console.log('Successfully uploaded file.', data)
      if (subject) {
        subject.next(value)
      }
      return true
    } catch (err) {
      console.log('There was an error uploading your file: ', err)
      return false
    }
  }

  async backup(): Promise<boolean> {
    const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
    const folder: fs.Folder = <fs.Folder>documents.getFolder(this.TRACKS_FOLDER);
    const entities: fs.FileSystemEntity[] = await folder.getEntities()

    for (let index = 0; index < entities.length; index++) {
      const entity = entities[index];
      const ret = this.uploadFile(entity.name, folder.getFile(entity.name))
      trace.write(`S3Store.backup(): ${entity.name} upload response ${ret}`, trace.categories.Debug)   
    }
  }

  async restore(): Promise<boolean> {
    try {
      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(ExternalStorageStore.TRACKS_FOLDER);
  
      const bucket = new S3({
        accessKeyId: S3Store.AWS-ACCESS-KEY-ID,
        secretAccessKey: S3Store.AWS-SECRET-ACCESS-KEY,
        region: S3Store.AWS-REGION
      });

      const listObjectsResp = await bucket.listObjects({Bucket: S3Store.AWS-BUCKET-NAME}).promise()
      for (let content in listObjectsResp.Contents) {
        const getObjectsResp = await bucket.getObject({Bucket: S3Store.AWS-BUCKET-NAME, Key: content.Key}).promise()
        this.setValue(getObjectsResp.Key, getObjectsResp.Body)
        trace.write(`S3Store.restore(): ${getObjectsResp.Key} downloaded`, trace.categories.Debug)  
      }
      return true 
    } catch (err) {
      console.log('There was an error uploading your file: ', err)
      return false
    }
  }
}