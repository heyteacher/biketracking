import { BehaviorSubject } from "rxjs";
import { Store } from "./store";
import * as permissions from 'nativescript-permissions'
import * as fs from 'tns-core-modules/file-system';
import { android as AndroidApplication } from "tns-core-modules/application";
import * as moment from 'moment'
const trace = require("trace");

declare var android: any

export class ExternalStorageStore extends Store {

  private static readonly TRACKS_FOLDER: string = 'tracks'

  static FileTraceWriter = (function () {
    function FileTraceWriter() { }
    FileTraceWriter.prototype.write = async (message, category, type) => {
      const traceMessage = moment().format('YYYY-MM-DD HH:mm:ss') + ' - ' + category + ' - ' + message;
      console.log(traceMessage);
      // const filePromise = ExternalStorageStore._getFile(moment().format('YYYY-MM-DD'), 'txt', 'logs')
      // if (filePromise) {
      //   filePromise.then(file => {
      //     if (file) {
      //       file.readText().then(text => file.writeText(`${text}\n${traceMessage}`))
      //     }
      //   })
      // }
    };
    return FileTraceWriter;
  })();


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

  protected async setValue<Type>(key: string, value: Type, subject: BehaviorSubject<Type> = null):
    Promise<boolean> {
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

  // private static async _checkPermission(permission) {
  //   if (!permissions.hasPermission(permission)) {
  //     try {
  //       await permissions.requestPermission(permission);
  //     } catch (error) {
  //     }
  //     return false
  //   }
  //   else {
  //     return true
  //   }
  // }

  private static async _getFile(key: string, extension: string = 'json') {
    let folderPath,folder:fs.Folder, fileName, file: fs.File
    try {
      trace.write('ExternalStorageStore._getFile key ' + key + ' extension '+ extension + ' subpath ' + ExternalStorageStore.TRACKS_FOLDER, trace.categories.Debug)        
      //if (!await ExternalStorageStore._checkPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE)) {
      //  return null
      //}
      //if (!await ExternalStorageStore._checkPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
      //  return null
      //}
      //folderPath = fs.path.join(android.os.Environment.getExternalStorageDirectory().getAbsolutePath().toString())
      //folder = fs.Folder.fromPath(`${folderPath}/${AndroidApplication.packageName}/${subpath}`)

      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(ExternalStorageStore.TRACKS_FOLDER);

      fileName = `${key}.${extension}`
      file = folder.getFile(fileName)
      return file;
  } catch (error) {
    trace.write('ExternalStorageStore._getFile: error folder ' + folder.path + ' filename ' + fileName, trace.categories.Debug)
    trace.write('ExternalStorageStore._getFile: error folder ' + error, trace.categories.Debug)
    return null
  }
}

  private static async _getFileName(key: string, permission: any = android.Manifest.permission.WRITE_EXTERNAL_STORAGE) {
    try {
      const documents: fs.Folder = <fs.Folder>fs.knownFolders.documents();
      const folder: fs.Folder = <fs.Folder>documents.getFolder(ExternalStorageStore.TRACKS_FOLDER);
      const filename = `${folder.path}/${key}.json`
      trace.write('ExternalStorageStore._getFileName:' + filename, trace.categories.Debug)
      return filename
    } catch (error) {
      trace.write('ExternalStorageStore._getFileName: error' + error, trace.categories.Debug)
      return null
    }
  }
}