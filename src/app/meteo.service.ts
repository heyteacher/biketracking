import { Injectable, OnDestroy, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { GeolocationService } from './geolocation.service';
import * as moment from 'moment'
import { InfoMeteo, OpenMeteoHourly, OpenMeteoResponse } from './models/types';
import { formatNumberValue } from "./utils/format";


const trace = require("trace");

@Injectable({
  providedIn: 'root'
})
export class MeteoService implements OnDestroy {

  private _infoMeteoData:InfoMeteo[] = []

  ngOnDestroy() {
  }

  constructor(
    private geolocation: GeolocationService,
    private httpClient: HttpClient) {
  }

  get infoMeteoData():InfoMeteo[] {
    return this._infoMeteoData
  }

  async updateMeteo(callback) {
    const location =  await this.geolocation.getCurrentLocation()
    if (!location) {
      trace.write(`liveTrack.updateMeteo: no location`, trace)
      callback({temperature_2m: null, weathercode: null})
      return
    }
    const url: string = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relativehumidity_2m,weathercode&timezone=Europe%2FBerlin&forecast_days=2`

    this.httpClient.get(url).subscribe((data: OpenMeteoResponse) => {
        if (data && data.hourly) {
            this._populateInfoMeteoData(data.hourly)
            const twoHourForecast:string = moment().add(2, 'hours').format("YYYY-MM-DDTHH:00")
            const twoHourForecastIdx = data.hourly['time'].indexOf(twoHourForecast)

            const now:string = moment().format("YYYY-MM-DDTHH:00")
            const nowIdx = data.hourly['time'].indexOf(now)

            let infoMeteo:InfoMeteo = {
                    time: null,
                    temperature: null,
                    weathercode: null,
                    humidity: null,
                    icon: null,
                    weather:null
            }

            if (nowIdx >= 0) {
                infoMeteo.time = moment(data.hourly.time[nowIdx]).format('HH:00')
                infoMeteo.temperature = `${formatNumberValue(data.hourly.temperature_2m[nowIdx], '1.0-0')}°`
                infoMeteo.humidity = `${formatNumberValue(data.hourly.relativehumidity_2m[nowIdx], '1.0-0')}%`
            }

            if (twoHourForecastIdx >= 0) {
                infoMeteo.weathercode = data.hourly.weathercode[twoHourForecastIdx]
            } 
            this._setIconAndWeather(infoMeteo)

            trace.write(`MeteoService.updateMeteo: time ${infoMeteo.time}, weather ${infoMeteo.weather}, temperature ${infoMeteo.temperature}, humidity ${infoMeteo.humidity}, weathercode ${infoMeteo.weathercode}`,trace.categories.Debug)
            if (callback) callback(infoMeteo)
        }
    })
  }

  private _populateInfoMeteoData(hourly: OpenMeteoHourly) {
    for (let index = 0; index < hourly.time.length; index++) {
      const time:string = hourly.time[index];

      if (moment(time).add(1, 'hours').isAfter(moment())) {
          const infoMeteo:InfoMeteo = {
            time: moment(time).format('HH:00'),
            humidity: `${formatNumberValue(hourly.relativehumidity_2m[index], '1.0-0')}%`,
            temperature: `${formatNumberValue(hourly.temperature_2m[index], '1.0-0')}°`,
            weathercode: hourly.weathercode[index],
            icon: '',
            weather: ''
          }
          this._setIconAndWeather(infoMeteo)
          this._infoMeteoData.push(infoMeteo)
      }    
    }
  }

  private _setIconAndWeather(infoMeteo: InfoMeteo) {
        let weather:string = ''
        let icon:string = ''
        if (infoMeteo.weathercode == 0) {
            weather = 'SUN'
            icon = String.fromCharCode(parseInt('f185', 16))
        } else if ((infoMeteo.weathercode >= 1 && infoMeteo.weathercode <=3) || (infoMeteo.weathercode >= 20 && infoMeteo.weathercode <=29)) {
            weather = 'SUNNY CLOUDLY'
            icon = String.fromCharCode(parseInt('f743', 16))
        } else if ((infoMeteo.weathercode >= 4 && infoMeteo.weathercode <=10) || (infoMeteo.weathercode >= 30 && infoMeteo.weathercode <=49)) {
            weather = 'FOG'
            icon = String.fromCharCode(parseInt('f75f', 16))
        } else if (infoMeteo.weathercode >= 11 && infoMeteo.weathercode <=19) {
            weather = 'CLOUDLY'
            icon = String.fromCharCode(parseInt('f0c2', 16))
        } else if (infoMeteo.weathercode >= 50 && infoMeteo.weathercode <=69) {
            weather = 'RAIN'
            icon = String.fromCharCode(parseInt('f73d', 16))
        } else if (infoMeteo.weathercode >= 70 && infoMeteo.weathercode <=79) {
            weather = 'SNOW'
            icon = String.fromCharCode(parseInt('f2dc', 16))
        } else if (infoMeteo.weathercode >= 80 && infoMeteo.weathercode <=90) {
            weather = 'HEAVY RAIN'
            icon = String.fromCharCode(parseInt('f740', 16))
        } else if (infoMeteo.weathercode >= 91 && infoMeteo.weathercode <=99) {
            weather = 'STORM'
            icon = String.fromCharCode(parseInt('f75a', 16))
        } 
        infoMeteo.icon = icon
        infoMeteo.weather = weather
  }
}