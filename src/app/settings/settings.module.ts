import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsComponent } from "./settings.component";
import { HeartRateComponent } from "./heart-rate/heart-rate.component";
import { HeartRateScannerComponent } from "./heart-rate/heart-rate-scanner.component";
import { CadenceComponent } from "./cadence/cadence.component";
import { CadenceScannerComponent } from "./cadence/cadence-scanner.component";
import { CreditsComponent } from "./credits/credits.component";
import { SupportUsComponent } from "./support-us/support-us.component";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";
import { HeartRateFilterPipe } from "./heart-rate-filter.pipe";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        SettingsRoutingModule,
        NativeScriptLocalizeModule
    ],
    declarations: [
        SettingsComponent,
        HeartRateComponent,
        HeartRateScannerComponent,
        CadenceComponent,
        CadenceScannerComponent,
        CreditsComponent,
        SupportUsComponent,
        HeartRateFilterPipe
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SettingsModule { }
