import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { HistoryRoutingModule } from "./history-routing.module";
import { HistoryComponent } from "./history.component";
import { TrackDetailsComponent } from "./track-details/track-details.component";
import { NativeScriptUIChartModule } from "nativescript-ui-chart/angular";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        HistoryRoutingModule,
        NativeScriptUIChartModule,
        NativeScriptLocalizeModule
    ],
    declarations: [
        HistoryComponent,
        TrackDetailsComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HistoryModule { }
