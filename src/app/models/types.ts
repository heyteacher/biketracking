import { GeoLocation } from "./GeoLocation";

export enum AppSettingsKey {
    MAPBOX_ACCESS_TOKEN = 'MAPBOX_ACCESS_TOKEN',
    MAPBOX_STYLE = 'MAPBOX_STYLE',
    HEART_RATE_PERIPHERAL_UUID = 'HEART_RATE_PERIPHERAL_UUID',
    HEART_RATE_PERIPHERAL_NAME = 'HEART_RATE_PERIPHERAL_NAME',
    CADENCE_RATE_PERIPHERAL_UUID = 'CADENCE_RATE_PERIPHERAL_UUID',
    CADENCE_RATE_PERIPHERAL_NAME = 'CADENCE_RATE_PERIPHERAL_NAME',
    AUTOMATIC_START_STOP = 'AUTOMATIC_START_STOP',
    DISPLAY_ALWAYS_ON = 'DISPLAY_ALWAYS_ON',
    VOICE_SUMMARY_TIME_INTERVAL_MIN = 'VOICE_SUMMARY_TIME_INTERVAL_MIN',
    COUNTDOWN = 'COUNTDOWN',
    DEBUG_TRACE = 'DEBUG_TRACE',
    GPS_HIGH_ACCURACY = 'GPS_HIGH_ACCURACY',
    GPS_UPDATE_DISTANCE_MT = 'GPS_UPDATE_DISTANCE_MT',
    GPS_UPDATE_TIME_SEC = 'GPS_UPDATE_TIME_MS',
    GPS_MINIMUM_UPDATE_TIME_SEC = 'GPS_MINIMUM_UPDATE_TIME_MS',
    DEM_AWS_API_KEY = 'DEM_AWS_API_KEY',
    AWS_BACKUP_RESTORE_ENDPOINT_PREFIX = "AWS_BACKUP_RESTORE_ENDPOINT_PREFIX",
    AWS_BACKUP_RESTORE_API_KEY = "AWS_BACKUP_RESTORE_API_KEY",
    AWS_BACKUP_RESTORE_REGION = "AWS_BACKUP_RESTORE_REGION",
}
 
export enum AppSettingsDefaultValue {
    MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGV5dGVhY2hlciIsImEiOiJja2FkeXNyZWYwYzRjMnRueHd0MzF2eDl4In0.KhuQSZVCbPk4ISBDsHTmrw',
    MAPBOX_STYLE = 'mapbox://styles/heyteacher/ckbdh4k8v202j1inuccmi89j7',
    //HEART_RATE_PERIPHERAL_UUID = '',
    //HEART_RATE_PERIPHERAL_NAME = '',
    AUTOMATIC_START_STOP = 'true',
    DISPLAY_ALWAYS_ON = 'true',
    VOICE_SUMMARY_TIME_INTERVAL_MIN = '15',
    COUNTDOWN = 'true',
    DEBUG_TRACE = 'true',
    GPS_HIGH_ACCURACY = 'false',
    GPS_UPDATE_DISTANCE_MT = '10',
    GPS_UPDATE_TIME_SEC = '10',
    GPS_MINIMUM_UPDATE_TIME_SEC = '5',
    DEM_AWS_API_KEY = 'qswqKiQYLo2HiA71PVmAP9AB4b5CiwJraExSURih',
    AWS_BACKUP_RESTORE_ENDPOINT_PREFIX = "",
    AWS_BACKUP_RESTORE_API_KEY = "",
    AWS_BACKUP_RESTORE_REGION = "",
}

export enum Tab {
    TRACK,
    MAP,
    HISTORY,
    SETTINGS
}

export enum AppStatus {
    EXIT,
    SUSPEND,
    RESUME,
    START,
    LOW_MEMORY,
    ERROR
}

export enum LiveStatus {
    STARTED,
    STOPPED,
    PAUSED,
    RESUMED
}

export interface ClimbDownHillAccumulator {
    climb: number, 
    downhill: number
    lastDem: number
}

// geo location
export interface Point {
    lat: number
    lng: number
}

// Biketracking Backend
export interface AWSDemResponse {
    status:boolean
    dem?:number
    message?: string
}

export interface AWSResponse {
    status:boolean
    message?: string
}

export interface AWSListResponse {
    status:boolean
    tracks: any[]
    message?: string
}

export interface AWSRestoreResponse {
    status:boolean
    track: any
    message?: string
}

// meteo
export interface InfoMeteo {
    temperature_2m: number
    weathercode: number
    relativehumidity_2m:number

}

export interface OpenMeteoHourly {
    time: string[],
    temperature_2m: number[]
    weathercode: number[]

}

export interface OpenMeteoResponse {
    latitude:number
    longitude:number
    hourly?: OpenMeteoHourly
}

// cadence device
export interface CrankRevolutions {
    timestamp: number,
    counter: number
}




export enum CadenceDeviceStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DICONNECTED",
  ERROR = "ERROR",
  NOTIFYING = "NOTIFYING"
}

// Credits
export interface Credits {
    text: string
    site: string
    license: string
}

export interface CountryAmzLinks {
    [Key: string]: AmzLink[]
}


export interface AmzLink {
    text: string
    image: string
    url: string
    heartrate?: boolean
}
