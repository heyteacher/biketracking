import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import * as appSettings from 'tns-core-modules/application-settings'
import { AppSettingsKey, AppSettingsDefaultValue } from './models/types'
import { TabsService } from './tabs.service'
import { ExternalStorageStore } from './store/external-storage-store';
import { Router } from '@angular/router';
import { Tabs } from "tns-core-modules/ui/tabs";


const trace = require("trace");

@Component({
    selector: 'ns-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

    constructor(
        private tabService: TabsService,
        private router: Router,
    ) {

    }

    @ViewChild('tabs', { static: false }) tabsRef: ElementRef;

    onSelectedIndexChanged($event) {
        this.tabService.setSelectedTab($event.newIndex)
    }

    ngOnInit(): void {
        trace.enable();

        // enable debug trace if is set in app settings
        if (appSettings.getBoolean(AppSettingsKey.DEBUG_TRACE, JSON.parse(AppSettingsDefaultValue.DEBUG_TRACE))) {
            trace.setCategories(trace.categories.Debug)
        }
        trace.addCategories(trace.categories.Error);

        trace.clearWriters();
        trace.addWriter(new ExternalStorageStore.FileTraceWriter());

        // if (!appSettings.hasKey(AppSettingsKey.MAPBOX_ACCESS_TOKEN)) {
        //     appSettings.setString(
        //         AppSettingsKey.MAPBOX_ACCESS_TOKEN,
        //         AppSettingsDefaultValue.MAPBOX_ACCESS_TOKEN
        //     )
        // }
        // if (!appSettings.hasKey(AppSettingsKey.MAPBOX_STYLE)) {
        //     appSettings.setString(
        //         AppSettingsKey.MAPBOX_STYLE,
        //         AppSettingsDefaultValue.MAPBOX_STYLE
        //     )
        // }
        this.tabService.getOpenTrackObserver().subscribe(trackId => this._openTrack(trackId))
    }

    _openTrack(trackId) {
        if (trackId) {
            const tabs = this.tabsRef.nativeElement as Tabs;
            tabs.selectedIndex = 2
            this.router.navigate(['', { outlets: { historyTab: ['history', 'track', trackId] } }])
        }
    }
}