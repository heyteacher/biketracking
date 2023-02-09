import { Component, OnInit } from "@angular/core";
//import { CountryAmzLinks, AmzLink } from "~/app/models/types";
import { RouterExtensions } from "nativescript-angular";
//import { AmzLinksService } from "~/app/amz-links.service";
const utilsModule = require("tns-core-modules/utils/utils");

@Component({
    selector: "SupportUs",
    templateUrl: "./support-us.component.html",
    styleUrls: ["./support-us.component.scss"]

})
export class SupportUsComponent {

    //countryAmzLinks: CountryAmzLinks = this.amzLinksService.countryAmzLinks
    
    constructor(
        private _routerExtensions: RouterExtensions,
        //private amzLinksService: AmzLinksService
    ) { }

    onBackTap() {
        this._routerExtensions.back()
    }

    openUrl(link: string) {
        utilsModule.openUrl(link)
    }
}