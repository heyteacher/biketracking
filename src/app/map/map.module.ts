import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";

import { MapRoutingModule } from "./map-routing.module";
import { MapComponent } from "./map.component";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        MapRoutingModule,
        NativeScriptLocalizeModule

    ],
    declarations: [
        MapComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class MapModule { }
