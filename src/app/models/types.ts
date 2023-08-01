import { GeoLocation } from "./GeoLocation";

export interface AWSDemResponse {
    status:boolean
    dem?:number
    message?: string
}

export interface Point {
    lat: number
    lng: number
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

/*
{
    "latitude": 52.52,
    "longitude": 13.419998,
    "generationtime_ms": 0.4349946975708008,
    "utc_offset_seconds": 0,
    "timezone": "GMT",
    "timezone_abbreviation": "GMT",
    "elevation": 38.0,
    "hourly_units": {
      "time": "iso8601",
      "temperature_2m": "°C",
      "weathercode": "wmo code"
    },
    "hourly": {
      "time": ["2023-08-01T00:00", "2023-08-01T01:00", "2023-08-01T02:00", "2023-08-01T03:00", "2023-08-01T04:00", "2023-08-01T05:00", "2023-08-01T06:00", "2023-08-01T07:00", "2023-08-01T08:00", "2023-08-01T09:00", "2023-08-01T10:00", "2023-08-01T11:00", "2023-08-01T12:00", "2023-08-01T13:00", "2023-08-01T14:00", "2023-08-01T15:00", "2023-08-01T16:00", "2023-08-01T17:00", "2023-08-01T18:00", "2023-08-01T19:00", "2023-08-01T20:00", "2023-08-01T21:00", "2023-08-01T22:00", "2023-08-01T23:00"],
      "temperature_2m": [17.6, 17.0, 16.9, 16.9, 16.8, 16.9, 17.2, 17.3, 18.0, 19.2, 19.4, 18.7, 18.3, 20.0, 21.3, 21.2, 20.6, 19.9, 18.9, 18.0, 17.2, 16.3, 15.7, 15.4],
      "weathercode": [61, 61, 61, 61, 3, 3, 61, 61, 61, 3, 3, 61, 61, 3, 3, 3, 3, 2, 3, 3, 80, 2, 1, 3]
    }
  }
*/











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
    AWS_BUCKET_NAME = "AWS_BUCKET_NAME"
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
    AWS_BACKUP_RESTORE_ENDPOINT_PREFIX = "zf9khqu3y9",
    AWS_BACKUP_RESTORE_API_KEY = "aGoDQ6OFsZ9bBdDzkUWcSaB1cDN6nFwF36DxDCIs",
    AWS_BACKUP_RESTORE_REGION = "eu-west-1",
    AWS_BUCKET_NAME = "biketracking-tracks"
}


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