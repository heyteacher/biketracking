import * as geolocation from "nativescript-geolocation"


export interface GeoLocation extends geolocation.Location{
    dem?:number
    bpm?:number
    distance?:number
    rpm?:number
}