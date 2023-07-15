import { Component, OnInit } from "@angular/core";
import { HeartrateService } from "../heartrate.service";
import { CadenceService } from "../cadence.service";
import { Switch } from "tns-core-modules/ui/switch";
import { TextField } from "tns-core-modules/ui/text-field";
import { AppSettingsKey, AppSettingsDefaultValue } from "../models/types";
import * as appSettings from 'tns-core-modules/application-settings'
import { GeolocationService } from "../geolocation.service";
import * as appversion from "nativescript-appversion";
@Component({
    selector: "Settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"]

})
export class SettingsComponent implements OnInit {


    constructor(
        private heartrateService: HeartrateService,
        private cadenceService: CadenceService,
        private geolocationService: GeolocationService) {
    }

    startHeartRate() {
        this.heartrateService.start()
    }

    
    startCadence() {
        this.cadenceService.start()
    }

    ngOnInit() {
    }

    get appVersionName(): string {
        return appversion.getVersionNameSync()
    }

    get appVersionCode(): string {
        return appversion.getVersionCodeSync()
    }

    // get automaticStartStop(): boolean {
    //     return appSettings.getBoolean(
    //         AppSettingsKey.AUTOMATIC_START_STOP,
    //         JSON.parse(AppSettingsDefaultValue.AUTOMATIC_START_STOP));
    // }
    // onStartStopCheckedChange(args) {
    //     const sw: Switch = <Switch>args.object;
    //     const isChecked = sw.checked;
    //     appSettings.setBoolean(AppSettingsKey.AUTOMATIC_START_STOP, isChecked)
    // }

    get displayAlwaysOn(): boolean {
        return appSettings.getBoolean(
            AppSettingsKey.DISPLAY_ALWAYS_ON,
            true);
    }
    onDisplayAlwaysOnCheckedChange(args) {
        const sw: Switch = <Switch>args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean(AppSettingsKey.DISPLAY_ALWAYS_ON, isChecked)
    }

    get countdown(): boolean {
        return appSettings.getBoolean(
            AppSettingsKey.COUNTDOWN,
            true);
    }
    onCountdownCheckedChange(args) {
        const sw: Switch = <Switch>args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean(AppSettingsKey.COUNTDOWN, isChecked)
    }

    get debugTrace(): boolean {
        return appSettings.getBoolean(
            AppSettingsKey.DEBUG_TRACE,
            false);
    }
    onDebugTraceCheckedChange(args) {
        const sw: Switch = <Switch>args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean(AppSettingsKey.DEBUG_TRACE, isChecked)
    }

    get highGPSAccuracy(): boolean {
        return appSettings.getBoolean(
            AppSettingsKey.GPS_HIGH_ACCURACY,
            JSON.parse(AppSettingsDefaultValue.GPS_HIGH_ACCURACY));
    }
    onHighGPSAccuracyCheckedChange(args) {
        const sw: Switch = <Switch>args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean(AppSettingsKey.GPS_HIGH_ACCURACY, isChecked)
    }


    get gpsUpdateDistanceMt(): number {
        return appSettings.getNumber(
            AppSettingsKey.GPS_UPDATE_DISTANCE_MT,
            parseInt(AppSettingsDefaultValue.GPS_UPDATE_DISTANCE_MT));
    }
    onGPSUpdateDistanceMtReturnPress(args) {
        let textField = <TextField>args.object;
        appSettings.setNumber(
            AppSettingsKey.GPS_UPDATE_DISTANCE_MT,
            parseInt(textField.text));
    }

    get gpsUpdateTimeSec(): number {
        return appSettings.getNumber(
            AppSettingsKey.GPS_UPDATE_TIME_SEC,
            parseInt(AppSettingsDefaultValue.GPS_UPDATE_TIME_SEC));
    }
    onGPSUpdateTimeSecReturnPress(args) {
        let textField = <TextField>args.object;
        appSettings.setNumber(
            AppSettingsKey.GPS_UPDATE_TIME_SEC,
            parseInt(textField.text));
    }

    get gpsMinimumUpdateTimeSec(): number {
        return appSettings.getNumber(
            AppSettingsKey.GPS_MINIMUM_UPDATE_TIME_SEC,
            parseInt(AppSettingsDefaultValue.GPS_MINIMUM_UPDATE_TIME_SEC));
    }
    onGPSMinimumUpdateTimeSecReturnPress(args) {
        let textField = <TextField>args.object;
        appSettings.setNumber(
            AppSettingsKey.GPS_MINIMUM_UPDATE_TIME_SEC,
            parseInt(textField.text));
    }

    get voiceSummaryTimeIntervalMin(): number {
        return appSettings.getNumber(
            AppSettingsKey.VOICE_SUMMARY_TIME_INTERVAL_MIN,
            parseInt(AppSettingsDefaultValue.VOICE_SUMMARY_TIME_INTERVAL_MIN));
    }
    onVoiceSummaryTimeIntervalMinReturnPress(args) {
        let textField = <TextField>args.object; 
        appSettings.setNumber(
            AppSettingsKey.VOICE_SUMMARY_TIME_INTERVAL_MIN,
            textField.text? parseInt(textField.text): 0);
            this.geolocationService.startVoiceSummaryTimer()
    }
}