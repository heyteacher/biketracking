import { BehaviorSubject } from "rxjs";

export abstract class Store {

    public static readonly TRACKS_FOLDER: string = 'tracks'
    protected static readonly LOGS_FOLDER: string = 'logs'
  
    protected abstract getValue<Type>(key: string, defaultValue: any): Promise<Type>     
    protected abstract  setValue<Type>(key: string, value: Type, subject: BehaviorSubject<Type>): Promise<boolean> 
    protected abstract  unsetValue<Type>(key: string, subject: BehaviorSubject<Type>): Promise<Boolean> 
    public abstract getYears(): Promise<string[]>
}
