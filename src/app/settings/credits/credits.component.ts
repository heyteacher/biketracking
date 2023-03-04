import { Component, OnInit } from "@angular/core";
import { Credits } from "~/app/models/types";
import { RouterExtensions } from "@nativescript/angular";
const utilsModule = require("tns-core-modules/utils/utils");

@Component({
    selector: "Credits",
    templateUrl: "./credits.component.html",
    styleUrls: ["./credits.component.scss"]

})
export class CreditsComponent implements OnInit {


    credits: Credits[]

    constructor(
        private _routerExtensions: RouterExtensions,
    ) { }

    onBackTap() {
        this._routerExtensions.back()
    }

    async ngOnInit() {
        this.credits = [
            {
                text: 'Angular',
                site: 'https://angular.io',
                license: 'https://github.com/angular/angular/blob/master/LICENSE'
            },
            {
                text: 'Geolib',
                site: 'https://github.com/manuelbieh/geolib',
                license: 'https://github.com/manuelbieh/geolib/blob/master/LICENSE'
            },
            {
                text: 'Font Awesome',
                site: 'https://fontawesome.com',
                license: 'https://fontawesome.com/license/free'
            },
            {
                text: 'NativeScript',
                site: 'https://nativescript.org/',
                license: 'https://github.com/NativeScript/nativescript-angular/blob/master/LICENSE'
            },
            {
                text: 'Moment',
                site: 'https://momentjs.com/',
                license: 'https://github.com/moment/moment/blob/develop/LICENSE'
            },
            {
                text: 'Nativescript Bluetooth',
                site: 'https://market.nativescript.org/plugins/nativescript-bluetooth',
                license: 'https://github.com/EddyVerbruggen/nativescript-bluetooth/blob/master/LICENSE'
            },
            {
                text: 'Nativescript Geolocation',
                site: 'https://market.nativescript.org/plugins/nativescript-geolocation',
                license: 'https://github.com/NativeScript/nativescript-geolocation/blob/master/LICENSE'
            },
            {
                text: 'Nativescript Mapbox',
                site: 'https://market.nativescript.org/plugins/nativescript-mapbox',
                license: 'https://github.com/Yermo/nativescript-mapbox/blob/master/LICENSE'
            },
            {
                text: 'Nativescript TextToSpeech',
                site: 'https://market.nativescript.org/plugins/nativescript-texttospeech',
                license: 'https://github.com/bradmartin/nativescript-texttospeech/blob/master/LICENSE'
            },
            {
                text: 'RxJs',
                site: 'https://rxjs-dev.firebaseapp.com/',
                license: 'https://github.com/ReactiveX/rxjs/blob/master/LICENSE.txt'
            },
            {
                text: 'Mapbox',
                site: 'https://www.mapbox.com/',
                license: 'https://www.mapbox.com/about/maps/'
            },
            {
                text: 'OpenStreetMap',
                site: 'https://www.openstreetmap.org',
                license: 'https://www.openstreetmap.org/about/'
            },
            {
                text: 'Nativescript Localize',
                site: 'https://github.com/EddyVerbruggen/nativescript-localize',
                license: 'https://github.com/EddyVerbruggen/nativescript-localize/blob/master/LICENSE'
            }]
    }

    openUrl(link: string) {
        utilsModule.openUrl(link)
    }
}