import { BaseTrack } from "./BaseTrack"
import { GeoLocation } from "./GeoLocation";

export interface Track extends BaseTrack {
    stopTime: string
    locations: GeoLocation[]
    maxSpeed?: number
    climb?: number
    downhill?: number;
    minAltitude?: number
    maxAltitude?: number
    pausedDuration: number
    maxBpm?: number;
}