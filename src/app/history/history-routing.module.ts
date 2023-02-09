import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { HistoryComponent } from "./history.component";
import { TrackDetailsComponent } from "./track-details/track-details.component";

const routes: Routes = [
    { path: "default", component: HistoryComponent },
    { path: "track/:id", component: TrackDetailsComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class HistoryRoutingModule { }
