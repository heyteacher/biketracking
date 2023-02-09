import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { LiveRoutingModule as LiveRoutingModule } from "./live-routing.module";
import { LiveComponent } from "./live.component";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        LiveRoutingModule,
        NativeScriptLocalizeModule
    ],
    declarations: [
        LiveComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class LiveModule { }
