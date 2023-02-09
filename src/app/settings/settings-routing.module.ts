import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SettingsComponent } from "./settings.component";
import { HeartRateComponent } from "./heart-rate/heart-rate.component";
import { HeartRateScannerComponent } from "./heart-rate/heart-rate-scanner.component";
import { CreditsComponent } from "./credits/credits.component";
import { SupportUsComponent } from "./support-us/support-us.component";

const routes: Routes = [
    { path: "default", component: SettingsComponent },
    { path: "heart-rate", component: HeartRateComponent },
    { path: "heart-rate/scanner", component: HeartRateScannerComponent },
    { path: "credits", component: CreditsComponent },
    { path: "support-us", component: SupportUsComponent }
]

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class SettingsRoutingModule { }
