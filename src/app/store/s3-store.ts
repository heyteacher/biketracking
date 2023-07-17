import { BehaviorSubject } from "rxjs";
import { Store } from "./store";
import * as fs from 'tns-core-modules/file-system';
import * as moment from 'moment'
const trace = require("trace");
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

export class S3Store extends Store {

  protected async getValue<Type>(key: string, defaultValue: any = null): Promise<Type> {
    if (this.existsValue(key)) {
      const file: fs.File = await ExternalStorageStore._getFile(key)
      if (file) {
        const json = await file.readText()
        return json ? JSON.parse(json) : defaultValue
      }
    }
    return defaultValue
  }

  protected async existsValue(key: string): Promise<boolean> {
    const filename = await ExternalStorageStore._getFileName(key)
    const exists =  filename && fs.File.exists(filename)
    trace.write('ExternalStorageStore._getFileName: filename ' + filename +' exists ' + exists, trace.categories.Debug)
    return exists
  }

  protected async unsetValue<Type>(key: string, subject: BehaviorSubject<Type> = null): Promise<Boolean> {
    if (this.existsValue(key)) {
      const file: fs.File = await ExternalStorageStore._getFile(key);
      if (file) {
        trace.write('ExternalStorageStore.unsetValue: file to remove ' + file.path, trace.categories.Debug)
        await file.remove()
        if (subject) {
          subject.next(null)
        }
        return true
      }
    }
    return false
  }

  protected async setValue<Type>(key: string, value: Type, subject: BehaviorSubject<Type> = null): Promise<boolean> {

    const contentType = file.type;
    const bucket = new S3(
          {
              accessKeyId: 'YOUR-ACCESS-KEY-ID',
              secretAccessKey: 'YOUR-SECRET-ACCESS-KEY',
              region: 'YOUR-REGION'
          }
      );
      const params = {
          Bucket: 'YOUR-BUCKET-NAME',
          Key: this.FOLDER + file.name,
          Body: file,
          ACL: 'public-read',
          ContentType: contentType
      };
      bucket.upload(params, function (err, data) {
          if (err) {
              console.log('There was an error uploading your file: ', err);
              return false;
          }
          console.log('Successfully uploaded file.', data);
          return true;
      });

    const file: fs.File = await ExternalStorageStore._getFile(key);
    if (file) {
      trace.write('ExternalStorageStore.setValue: file to write ' + file.path, trace.categories.Debug)
      await file.writeText(JSON.stringify(value))
      if (subject) {
        subject.next(value)
      }
      return true
    }
    return false
  }

  async getYears(): Promise<string[]> {
    const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
    const folder: fs.Folder = <fs.Folder>documents.getFolder(ExternalStorageStore.TRACKS_FOLDER);
    //const folderPath = fs.path.join(android.os.Environment.getExternalStorageDirectory().getAbsolutePath().toString());
    //const folder: fs.Folder = fs.Folder.fromPath(`${folderPath}/${AndroidApplication.packageName}`);

    const entities: fs.FileSystemEntity[] = await folder.getEntities()
    const years: string[] = entities
      .filter((entity: fs.FileSystemEntity) => {
        return entity.name.length == 9 && entity.name.endsWith('.json')
      })
      .map((entity: fs.FileSystemEntity) => {
        return entity.name.substr(0, 4)
      })
      .sort()
      .reverse()
    // if no year tracks found, return array with current year as single year
    if (years && years.length > 0) {
      return years
    }
    else {
      return [moment().format('YYYY')]
    }
  }
}